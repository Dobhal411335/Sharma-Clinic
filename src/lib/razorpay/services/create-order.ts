import { Prisma } from "@prisma/client";

import { db } from "@/lib/db/prisma";
import {
  logExternalServiceError,
  logPerformance,
  logger,
} from "@/lib/logger";

import { getRazorpayClient } from "../client";
import { getRazorpayPublicKeyId } from "../config";
import {
  CreateOrderResult,
  RAZORPAY_CURRENCY,
  RazorpayIntegrationError,
  type RazorpayOrderEntity,
} from "../types";
import { paymentAttemptIdempotencyKey } from "../utils/generate-idempotency-key";
import { isActivePaymentStatus } from "../utils/payment-status";

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function logOrderReady(result: CreateOrderResult, appointmentId: string, reused: boolean): CreateOrderResult {
  logger.info(reused ? "Razorpay order reused" : "Razorpay order created", {
    module: "razorpay",
    function: "createOrder",
    appointmentId,
    paymentId: result.paymentId,
    meta: {
      orderId: result.orderId,
      amountPaise: result.amount,
      currency: result.currency,
      reused,
    },
  });
  return result;
}

async function createRazorpayOrder(input: {
  amountPaise: number;
  receipt: string;
  notes: Record<string, string>;
}): Promise<RazorpayOrderEntity> {
  const client = getRazorpayClient();
  const started = Date.now();

  try {
    // Capture mode: prefer Razorpay Dashboard auto-capture (automatic).
    // Orders API does not take a generic payment_capture flag for standard orders.
    const order = (await client.orders.create({
      amount: input.amountPaise,
      currency: RAZORPAY_CURRENCY,
      receipt: input.receipt.slice(0, 40),
      notes: input.notes,
    })) as RazorpayOrderEntity;

    logPerformance({
      kind: "external",
      operation: "razorpay.createOrder",
      durationMs: Date.now() - started,
      module: "razorpay",
      function: "createRazorpayOrder",
    });

    if (!order?.id || typeof order.amount !== "number") {
      throw new RazorpayIntegrationError(
        "Razorpay returned an incomplete order.",
        "RAZORPAY_INCOMPLETE_ORDER",
        502,
      );
    }

    return order;
  } catch (error) {
    if (error instanceof RazorpayIntegrationError) {
      throw error;
    }
    logExternalServiceError("razorpay", error, {
      module: "razorpay",
      function: "createRazorpayOrder",
      durationMs: Date.now() - started,
      paymentId: input.notes.paymentId,
      appointmentId: input.notes.appointmentId,
    });
    throw new RazorpayIntegrationError(
      "Failed to create Razorpay order.",
      "RAZORPAY_ORDER_CREATE_FAILED",
      502,
    );
  }
}

/**
 * Creates (or reuses) a payment attempt + Razorpay order for an appointment.
 *
 * - Fee comes only from the appointment fee snapshot (never the client).
 * - One ACTIVE attempt per appointment (DB unique on activeAppointmentId).
 * - Retries / double-clicks reuse the existing active order.
 * - After FAILED/EXPIRED, a new attempt + new Razorpay order is created.
 * - PAID appointments block further attempts.
 *
 * Capture mode: automatic (`payment_capture: true` on order creation).
 */
export async function createOrder(
  appointmentId: string,
): Promise<CreateOrderResult> {
  const trimmedId = appointmentId?.trim();
  if (!trimmedId) {
    throw new RazorpayIntegrationError(
      "appointmentId is required.",
      "APPOINTMENT_ID_REQUIRED",
    );
  }

  const appointment = await db.appointment.findUnique({
    where: { id: trimmedId },
    include: { doctor: true },
  });

  if (!appointment) {
    throw new RazorpayIntegrationError(
      "Appointment not found.",
      "APPOINTMENT_NOT_FOUND",
      404,
    );
  }

  if (
    appointment.status === "CANCELLED" ||
    appointment.status === "EXPIRED" ||
    appointment.status === "COMPLETED"
  ) {
    throw new RazorpayIntegrationError(
      "Appointment is not payable.",
      "APPOINTMENT_NOT_PAYABLE",
      409,
    );
  }

  if (appointment.feeSnapshotPaise <= 0) {
    throw new RazorpayIntegrationError(
      "Appointment fee is invalid.",
      "INVALID_APPOINTMENT_FEE",
      500,
    );
  }

  const existingPaid = await db.payment.findFirst({
    where: { appointmentId: trimmedId, status: "PAID" },
  });

  if (existingPaid) {
    throw new RazorpayIntegrationError(
      "Appointment is already paid.",
      "APPOINTMENT_ALREADY_PAID",
      409,
    );
  }

  // Reuse active attempt if present (double-click / refresh).
  const active = await db.payment.findFirst({
    where: {
      appointmentId: trimmedId,
      status: { in: ["CREATED", "ORDER_CREATED", "PENDING"] },
    },
    orderBy: { attemptNumber: "desc" },
  });

  if (active?.providerOrderId && isActivePaymentStatus(active.status)) {
    return logOrderReady(
      {
        paymentId: active.id,
        orderId: active.providerOrderId,
        amount: active.amountPaise,
        currency: RAZORPAY_CURRENCY,
        keyId: getRazorpayPublicKeyId(),
      },
      trimmedId,
      true,
    );
  }

  // If an active row exists without an order yet, finish order creation.
  if (active && !active.providerOrderId) {
    const order = await createRazorpayOrder({
      amountPaise: active.amountPaise,
      receipt: `p_${active.id}`,
      notes: {
        appointmentId: trimmedId,
        paymentId: active.id,
        attemptNumber: String(active.attemptNumber),
      },
    });

    const updated = await db.payment.update({
      where: { id: active.id },
      data: {
        providerOrderId: order.id,
        status: "ORDER_CREATED",
        activeAppointmentId: trimmedId,
      },
    });

    return logOrderReady(
      {
        paymentId: updated.id,
        orderId: order.id,
        amount: updated.amountPaise,
        currency: RAZORPAY_CURRENCY,
        keyId: getRazorpayPublicKeyId(),
      },
      trimmedId,
      false,
    );
  }

  const lastAttempt = await db.payment.findFirst({
    where: { appointmentId: trimmedId },
    orderBy: { attemptNumber: "desc" },
    select: { attemptNumber: true },
  });

  const attemptNumber = (lastAttempt?.attemptNumber ?? 0) + 1;
  const idempotencyKey = paymentAttemptIdempotencyKey(trimmedId, attemptNumber);
  const amountPaise = appointment.feeSnapshotPaise;

  let paymentId: string;

  try {
    const created = await db.$transaction(async (tx) => {
      const paidAgain = await tx.payment.findFirst({
        where: { appointmentId: trimmedId, status: "PAID" },
      });
      if (paidAgain) {
        throw new RazorpayIntegrationError(
          "Appointment is already paid.",
          "APPOINTMENT_ALREADY_PAID",
          409,
        );
      }

      const stillActive = await tx.payment.findFirst({
        where: {
          appointmentId: trimmedId,
          status: { in: ["CREATED", "ORDER_CREATED", "PENDING"] },
        },
      });
      if (stillActive) {
        return stillActive;
      }

      return tx.payment.create({
        data: {
          appointmentId: trimmedId,
          attemptNumber,
          idempotencyKey,
          amountPaise,
          currency: appointment.currency || RAZORPAY_CURRENCY,
          feeSnapshotPaise: appointment.feeSnapshotPaise,
          doctorFeePaise: appointment.doctor.consultationFeePaise,
          status: "CREATED",
          activeAppointmentId: trimmedId,
        },
      });
    });

    paymentId = created.id;

    if (created.providerOrderId && isActivePaymentStatus(created.status)) {
      return logOrderReady(
        {
          paymentId: created.id,
          orderId: created.providerOrderId,
          amount: created.amountPaise,
          currency: RAZORPAY_CURRENCY,
          keyId: getRazorpayPublicKeyId(),
        },
        trimmedId,
        true,
      );
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      // Concurrent create-order: reuse the winner's active attempt.
      logger.info("Razorpay create-order concurrent conflict; reusing winner", {
        module: "razorpay",
        function: "createOrder",
        appointmentId: trimmedId,
      });
      const winner = await db.payment.findFirst({
        where: {
          appointmentId: trimmedId,
          status: { in: ["CREATED", "ORDER_CREATED", "PENDING"] },
        },
        orderBy: { attemptNumber: "desc" },
      });

      if (winner?.providerOrderId) {
        return logOrderReady(
          {
            paymentId: winner.id,
            orderId: winner.providerOrderId,
            amount: winner.amountPaise,
            currency: RAZORPAY_CURRENCY,
            keyId: getRazorpayPublicKeyId(),
          },
          trimmedId,
          true,
        );
      }

      if (winner) {
        paymentId = winner.id;
      } else {
        throw new RazorpayIntegrationError(
          "Could not create payment attempt due to a concurrent conflict.",
          "PAYMENT_ATTEMPT_CONFLICT",
          409,
        );
      }
    } else if (error instanceof RazorpayIntegrationError) {
      throw error;
    } else {
      throw error;
    }
  }

  const payment = await db.payment.findUniqueOrThrow({
    where: { id: paymentId },
  });

  if (payment.providerOrderId) {
    return logOrderReady(
      {
        paymentId: payment.id,
        orderId: payment.providerOrderId,
        amount: payment.amountPaise,
        currency: RAZORPAY_CURRENCY,
        keyId: getRazorpayPublicKeyId(),
      },
      trimmedId,
      true,
    );
  }

  const order = await createRazorpayOrder({
    amountPaise: payment.amountPaise,
    receipt: `p_${payment.id}`,
    notes: {
      appointmentId: trimmedId,
      paymentId: payment.id,
      attemptNumber: String(payment.attemptNumber),
    },
  });

  try {
    const updated = await db.payment.update({
      where: { id: payment.id },
      data: {
        providerOrderId: order.id,
        status: "ORDER_CREATED",
        activeAppointmentId: trimmedId,
      },
    });

    return logOrderReady(
      {
        paymentId: updated.id,
        orderId: order.id,
        amount: updated.amountPaise,
        currency: RAZORPAY_CURRENCY,
        keyId: getRazorpayPublicKeyId(),
      },
      trimmedId,
      false,
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      // Extremely rare: another worker attached the same order id — reload.
      const existing = await db.payment.findFirst({
        where: {
          OR: [{ id: payment.id }, { providerOrderId: order.id }],
        },
      });
      if (existing?.providerOrderId) {
        return logOrderReady(
          {
            paymentId: existing.id,
            orderId: existing.providerOrderId,
            amount: existing.amountPaise,
            currency: RAZORPAY_CURRENCY,
            keyId: getRazorpayPublicKeyId(),
          },
          trimmedId,
          true,
        );
      }
    }
    throw error;
  }
}
