import type { PaymentStatus } from "@prisma/client";

import {
  ACTIVE_PAYMENT_STATUSES,
  RazorpayIntegrationError,
  type ActivePaymentStatus,
} from "../types";

const ALLOWED_TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  CREATED: ["ORDER_CREATED", "FAILED", "EXPIRED"],
  ORDER_CREATED: ["PENDING", "PAID", "FAILED", "EXPIRED"],
  PENDING: ["PAID", "FAILED", "EXPIRED"],
  PAID: ["REFUNDED", "PARTIALLY_REFUNDED"],
  PARTIALLY_REFUNDED: ["REFUNDED", "PARTIALLY_REFUNDED"],
  FAILED: [],
  EXPIRED: [],
  REFUNDED: [],
};

export function isActivePaymentStatus(
  status: PaymentStatus,
): status is ActivePaymentStatus {
  return (ACTIVE_PAYMENT_STATUSES as readonly string[]).includes(status);
}

export function isTerminalFailureStatus(status: PaymentStatus): boolean {
  return status === "FAILED" || status === "EXPIRED";
}

export function canTransitionPaymentStatus(
  from: PaymentStatus,
  to: PaymentStatus,
): boolean {
  if (from === to) {
    return true;
  }
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Rejects invalid transitions. Never allows PAID → FAILED/EXPIRED (stale events).
 */
export function assertPaymentTransition(
  from: PaymentStatus,
  to: PaymentStatus,
): void {
  if (!canTransitionPaymentStatus(from, to)) {
    throw new RazorpayIntegrationError(
      `Invalid payment status transition: ${from} → ${to}.`,
      "INVALID_PAYMENT_TRANSITION",
      409,
    );
  }
}

/**
 * Applies a transition if allowed. Returns whether the status changed.
 * Idempotent same-status updates return changed=false without error.
 * Downgrades from PAID are refused (caller should ignore stale events).
 */
export function resolvePaymentTransition(
  current: PaymentStatus,
  next: PaymentStatus,
): { apply: boolean; ignoreStale: boolean } {
  if (current === next) {
    return { apply: false, ignoreStale: false };
  }

  if (current === "PAID" && next !== "REFUNDED") {
    return { apply: false, ignoreStale: true };
  }

  if (current === "REFUNDED") {
    return { apply: false, ignoreStale: true };
  }

  if (!canTransitionPaymentStatus(current, next)) {
    return { apply: false, ignoreStale: true };
  }

  return { apply: true, ignoreStale: false };
}

export function activeLockValue(
  appointmentId: string,
  status: PaymentStatus,
): string | null {
  return isActivePaymentStatus(status) ? appointmentId : null;
}

export function mapRazorpayPaymentStatusToLocal(
  razorpayStatus: string,
  captured: boolean,
): PaymentStatus | null {
  const normalized = razorpayStatus.toLowerCase();

  if (normalized === "captured" || (normalized === "authorized" && captured)) {
    return "PAID";
  }
  if (normalized === "authorized") {
    return "PENDING";
  }
  if (normalized === "failed") {
    return "FAILED";
  }
  if (normalized === "refunded") {
    return "REFUNDED";
  }

  return null;
}
