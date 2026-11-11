import type { Payment, Prisma } from "@prisma/client";

import { db } from "@/lib/db/prisma";
import { logAuditEvent, logger } from "@/lib/logger";

import { RazorpayIntegrationError } from "../types";
import { resolvePaymentTransition } from "../utils/payment-status";
import { notifyPaymentSucceeded } from "./notifications";

type Tx = Prisma.TransactionClient;

async function flagDuplicateSuccess(
  tx: Tx,
  appointmentId: string,
  winningPaymentId: string,
  conflictingProviderPaymentId: string | null,
): Promise<void> {
  const note = `Multiple successful payment attempts detected. Conflicting providerPaymentId=${conflictingProviderPaymentId ?? "unknown"}. Manual reconciliation/refund required.`;

  logger.warn("Duplicate successful payment attempts detected", {
    module: "razorpay",
    function: "flagDuplicateSuccess",
    paymentId: winningPaymentId,
    appointmentId,
    meta: { duplicateDetected: true },
  });

  await tx.payment.updateMany({
    where: {
      appointmentId,
      OR: [{ id: winningPaymentId }, { status: "PAID" }],
    },
    data: {
      needsReconciliation: true,
      reconciliationNote: note,
    },
  });
}

/**
 * Transactionally marks a payment PAID, confirms the appointment, and clears
 * the active lock. Never deletes payment rows. Never downgrades PAID.
 *
 * If another attempt is already PAID for the same appointment, both are flagged
 * for reconciliation — the new success is still recorded when possible.
 */
export async function markPaymentPaid(input: {
  paymentId: string;
  providerPaymentId: string;
  providerOrderId?: string | null;
  source: "verify" | "webhook" | "capture" | "reconcile";
  skipNotifications?: boolean;
}): Promise<{ payment: Payment; alreadyPaid: boolean; newlyPaid: boolean }> {
  const result = await db.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: input.paymentId },
    });

    if (!payment) {
      throw new RazorpayIntegrationError(
        "Payment not found.",
        "PAYMENT_NOT_FOUND",
        404,
      );
    }

    if (payment.status === "PAID") {
      if (
        payment.providerPaymentId &&
        payment.providerPaymentId !== input.providerPaymentId
      ) {
        await flagDuplicateSuccess(
          tx,
          payment.appointmentId,
          payment.id,
          input.providerPaymentId,
        );
      }

      return { payment, alreadyPaid: true, newlyPaid: false };
    }

    const transition = resolvePaymentTransition(payment.status, "PAID");
    if (!transition.apply) {
      throw new RazorpayIntegrationError(
        `Cannot mark payment PAID from status ${payment.status}.`,
        "INVALID_PAYMENT_TRANSITION",
        409,
      );
    }

    const otherPaid = await tx.payment.findFirst({
      where: {
        appointmentId: payment.appointmentId,
        status: "PAID",
        id: { not: payment.id },
      },
    });

    const updated = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        providerPaymentId: input.providerPaymentId,
        providerOrderId: input.providerOrderId ?? payment.providerOrderId,
        paidAt: new Date(),
        activeAppointmentId: null,
        failureReason: null,
        ...(otherPaid
          ? {
              needsReconciliation: true,
              reconciliationNote: `Second successful payment recorded via ${input.source}. Manual reconciliation/refund required.`,
            }
          : {}),
      },
    });

    if (otherPaid) {
      await flagDuplicateSuccess(
        tx,
        payment.appointmentId,
        payment.id,
        input.providerPaymentId,
      );
    }

    // Payment succeeded — appointment awaits admin accept/decline.
    await tx.appointment.update({
      where: { id: payment.appointmentId },
      data: {
        status: "PENDING",
      },
    });

    // Expire any other active attempts for this appointment (do not delete).
    await tx.payment.updateMany({
      where: {
        appointmentId: payment.appointmentId,
        id: { not: payment.id },
        status: { in: ["CREATED", "ORDER_CREATED", "PENDING"] },
      },
      data: {
        status: "EXPIRED",
        activeAppointmentId: null,
        failureReason: "Superseded by successful payment on another attempt.",
      },
    });

    return { payment: updated, alreadyPaid: false, newlyPaid: true };
  });

  if (result.newlyPaid) {
    void logAuditEvent({
      action: "payment.marked_paid",
      entityType: "Payment",
      entityId: result.payment.id,
      metadata: {
        appointmentId: result.payment.appointmentId,
        source: input.source,
        amountPaise: result.payment.amountPaise,
        currency: result.payment.currency,
      },
    });

    if (!input.skipNotifications) {
      // After commit — email failures must not roll back payment.
      void notifyPaymentSucceeded({
        paymentId: result.payment.id,
        appointmentId: result.payment.appointmentId,
      });
    }
  }

  return result;
}

/**
 * Marks a payment FAILED/EXPIRED and releases the active lock so a new attempt can start.
 */
export async function markPaymentFailed(input: {
  paymentId: string;
  status: "FAILED" | "EXPIRED";
  reason?: string;
  providerPaymentId?: string;
}): Promise<Payment> {
  return db.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: input.paymentId },
    });

    if (!payment) {
      throw new RazorpayIntegrationError(
        "Payment not found.",
        "PAYMENT_NOT_FOUND",
        404,
      );
    }

    const transition = resolvePaymentTransition(payment.status, input.status);
    if (!transition.apply) {
      // Never downgrade PAID on stale failure events.
      return payment;
    }

    return tx.payment.update({
      where: { id: payment.id },
      data: {
        status: input.status,
        activeAppointmentId: null,
        failureReason: input.reason?.slice(0, 500) ?? payment.failureReason,
        providerPaymentId: input.providerPaymentId ?? payment.providerPaymentId,
      },
    });
  });
}
