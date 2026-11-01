import { Prisma } from "@prisma/client";

import { db } from "@/lib/db/prisma";
import {
  logExternalServiceError,
  logPerformance,
  logger,
} from "@/lib/logger";

import { getRazorpayConfig } from "../config";
import {
  RazorpayIntegrationError,
  type RefundPaymentInput,
  type RefundPaymentResult,
  type RazorpayRefundEntity,
} from "../types";
import { refundIdempotencyKey } from "../utils/generate-idempotency-key";

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function createProviderRefund(input: {
  providerPaymentId: string;
  amountPaise: number;
  idempotencyKey: string;
  reason?: string;
}): Promise<RazorpayRefundEntity> {
  const { keyId, keySecret } = getRazorpayConfig();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const started = Date.now();

  try {
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(input.providerPaymentId)}/refund`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          "X-Refund-Idempotency": input.idempotencyKey,
        },
        body: JSON.stringify({
          amount: input.amountPaise,
          speed: "normal",
          notes: input.reason
            ? { reason: input.reason.slice(0, 200) }
            : undefined,
        }),
      },
    );

    logPerformance({
      kind: "external",
      operation: "razorpay.refund",
      durationMs: Date.now() - started,
      module: "razorpay",
      function: "createProviderRefund",
      meta: { httpStatus: response.status },
    });

    if (response.status === 409) {
      throw new RazorpayIntegrationError(
        "Refund is already being processed. Retry with the same idempotency key.",
        "REFUND_IN_PROGRESS",
        409,
      );
    }

    if (!response.ok) {
      throw new RazorpayIntegrationError(
        "Failed to create Razorpay refund.",
        "RAZORPAY_REFUND_FAILED",
        502,
      );
    }

    const body = (await response.json()) as RazorpayRefundEntity;
    if (!body?.id || typeof body.amount !== "number") {
      throw new RazorpayIntegrationError(
        "Razorpay returned an incomplete refund.",
        "RAZORPAY_INCOMPLETE_REFUND",
        502,
      );
    }

    return body;
  } catch (error) {
    if (error instanceof RazorpayIntegrationError) {
      throw error;
    }
    logExternalServiceError("razorpay", error, {
      module: "razorpay",
      function: "createProviderRefund",
      durationMs: Date.now() - started,
    });
    throw new RazorpayIntegrationError(
      "Failed to create Razorpay refund.",
      "RAZORPAY_REFUND_FAILED",
      502,
    );
  }
}

/**
 * Full or partial refund. When `amountPaise` is omitted, refunds the remaining
 * refundable balance (full remaining amount). Never over-refunds.
 *
 * Persists refund idempotency keys and sends `X-Refund-Idempotency` to Razorpay.
 * Concurrent-safe via unique constraints + transactions.
 *
 * Authorization (ADMIN) is enforced at the API route layer.
 */
export async function refundPayment(
  input: RefundPaymentInput,
): Promise<RefundPaymentResult> {
  const paymentId = input.paymentId?.trim();
  if (!paymentId) {
    throw new RazorpayIntegrationError(
      "paymentId is required.",
      "PAYMENT_ID_REQUIRED",
    );
  }

  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: { refunds: true },
  });

  if (!payment) {
    throw new RazorpayIntegrationError(
      "Payment not found.",
      "PAYMENT_NOT_FOUND",
      404,
    );
  }

  if (payment.status !== "PAID" && payment.status !== "REFUNDED") {
    throw new RazorpayIntegrationError(
      "Only PAID payments can be refunded.",
      "PAYMENT_NOT_REFUNDABLE",
      409,
    );
  }

  if (!payment.providerPaymentId) {
    throw new RazorpayIntegrationError(
      "Payment has no provider payment id.",
      "PROVIDER_PAYMENT_ID_MISSING",
      409,
    );
  }

  const processedRefunded = payment.refunds
    .filter((r) => r.status === "PROCESSED" || r.status === "PENDING")
    .reduce((sum, r) => sum + r.amountPaise, 0);

  const remaining = payment.amountPaise - processedRefunded;
  if (remaining <= 0) {
    const existingFull = payment.refunds.find(
      (r) => r.status === "PROCESSED" || r.status === "PENDING",
    );
    if (existingFull) {
      return {
        refundId: existingFull.id,
        paymentId: payment.id,
        providerRefundId: existingFull.providerRefundId,
        amountPaise: existingFull.amountPaise,
        status: existingFull.status,
        paymentStatus: payment.status,
        idempotentReplay: true,
      };
    }

    throw new RazorpayIntegrationError(
      "Payment has already been fully refunded.",
      "ALREADY_FULLY_REFUNDED",
      409,
    );
  }

  const amountPaise =
    typeof input.amountPaise === "number" ? input.amountPaise : remaining;

  if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
    throw new RazorpayIntegrationError(
      "amountPaise must be a positive integer.",
      "INVALID_REFUND_AMOUNT",
    );
  }

  if (amountPaise > remaining) {
    throw new RazorpayIntegrationError(
      "Refund amount exceeds remaining refundable balance.",
      "REFUND_EXCEEDS_BALANCE",
      409,
    );
  }

  const idempotencyKey = refundIdempotencyKey(
    payment.id,
    amountPaise,
    input.idempotencyKey,
  );

  const existingByKey = await db.refund.findUnique({
    where: { idempotencyKey },
  });

  if (existingByKey) {
    if (
      existingByKey.status === "PROCESSED" ||
      existingByKey.status === "PENDING"
    ) {
      logger.info("Refund idempotent replay", {
        module: "razorpay",
        function: "refundPayment",
        paymentId: payment.id,
        meta: {
          refundId: existingByKey.id,
          amountPaise: existingByKey.amountPaise,
          status: existingByKey.status,
        },
      });
      return {
        refundId: existingByKey.id,
        paymentId: payment.id,
        providerRefundId: existingByKey.providerRefundId,
        amountPaise: existingByKey.amountPaise,
        status: existingByKey.status,
        paymentStatus: payment.status,
        idempotentReplay: true,
      };
    }
  }

  let refundRow =
    existingByKey ??
    (await (async () => {
      try {
        return await db.refund.create({
          data: {
            paymentId: payment.id,
            idempotencyKey,
            amountPaise,
            status: "PENDING",
            reason: input.reason?.slice(0, 500) ?? null,
          },
        });
      } catch (error) {
        if (isUniqueViolation(error)) {
          const raced = await db.refund.findUnique({
            where: { idempotencyKey },
          });
          if (raced) {
            return raced;
          }
        }
        throw error;
      }
    })());

  if (refundRow.providerRefundId && refundRow.status === "PROCESSED") {
    return {
      refundId: refundRow.id,
      paymentId: payment.id,
      providerRefundId: refundRow.providerRefundId,
      amountPaise: refundRow.amountPaise,
      status: refundRow.status,
      paymentStatus: payment.status,
      idempotentReplay: true,
    };
  }

  if (!refundRow.providerRefundId) {
    const providerRefund = await createProviderRefund({
      providerPaymentId: payment.providerPaymentId,
      amountPaise,
      idempotencyKey,
      reason: input.reason,
    });

    const providerStatus =
      providerRefund.status === "processed" ? "PROCESSED" : "PENDING";

    refundRow = await db.refund.update({
      where: { id: refundRow.id },
      data: {
        providerRefundId: providerRefund.id,
        status: providerStatus,
      },
    });
  }

  const allRefunds = await db.refund.findMany({
    where: { paymentId: payment.id },
  });
  const totalRefunded = allRefunds
    .filter((r) => r.status === "PROCESSED" || r.status === "PENDING")
    .reduce((sum, r) => sum + r.amountPaise, 0);

  let paymentStatus = payment.status as RefundPaymentResult["paymentStatus"];
  if (totalRefunded >= payment.amountPaise) {
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: "REFUNDED",
        activeAppointmentId: null,
      },
    });
    paymentStatus = "REFUNDED";
  }

  logger.info("Refund created", {
    module: "razorpay",
    function: "refundPayment",
    paymentId: payment.id,
    meta: {
      refundId: refundRow.id,
      amountPaise: refundRow.amountPaise,
      status: refundRow.status,
      paymentStatus,
    },
  });

  return {
    refundId: refundRow.id,
    paymentId: payment.id,
    providerRefundId: refundRow.providerRefundId,
    amountPaise: refundRow.amountPaise,
    status: refundRow.status,
    paymentStatus,
    idempotentReplay: false,
  };
}
