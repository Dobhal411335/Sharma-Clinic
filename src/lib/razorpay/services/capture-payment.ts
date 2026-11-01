import { db } from "@/lib/db/prisma";
import {
  logExternalServiceError,
  logPerformance,
  logger,
} from "@/lib/logger";

import { getRazorpayClient } from "../client";
import {
  CapturePaymentResult,
  RAZORPAY_CAPTURE_MODE,
  RazorpayIntegrationError,
  type RazorpayPaymentEntity,
} from "../types";
import { fetchPayment } from "./fetch-payment";
import { markPaymentPaid } from "./mark-paid";

export { RAZORPAY_CAPTURE_MODE };

/**
 * Captures an authorized Razorpay payment when automatic capture did not run.
 *
 * Preferred production mode is automatic capture at Checkout/order time
 * (`RAZORPAY_CAPTURE_MODE = "automatic"`). This helper covers authorized-only
 * edge cases (e.g. delayed capture settings or webhook races).
 */
export async function capturePayment(input: {
  paymentId: string;
  providerPaymentId?: string;
}): Promise<CapturePaymentResult> {
  const payment = await db.payment.findUnique({
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
    logger.info("Capture skipped; payment already PAID", {
      module: "razorpay",
      function: "capturePayment",
      paymentId: payment.id,
      appointmentId: payment.appointmentId,
    });
    return {
      paymentId: payment.id,
      providerPaymentId: payment.providerPaymentId ?? input.providerPaymentId ?? "",
      status: "PAID",
      captured: true,
    };
  }

  const providerPaymentId =
    input.providerPaymentId?.trim() || payment.providerPaymentId;

  if (!providerPaymentId) {
    throw new RazorpayIntegrationError(
      "providerPaymentId is required to capture.",
      "PROVIDER_PAYMENT_ID_REQUIRED",
    );
  }

  const remote = await fetchPayment(providerPaymentId);

  if (remote.amountPaise !== payment.amountPaise) {
    throw new RazorpayIntegrationError(
      "Payment amount mismatch.",
      "AMOUNT_MISMATCH",
      409,
    );
  }

  if (remote.currency.toUpperCase() !== payment.currency.toUpperCase()) {
    throw new RazorpayIntegrationError(
      "Payment currency mismatch.",
      "CURRENCY_MISMATCH",
      409,
    );
  }

  if (remote.captured || remote.status === "captured") {
    await markPaymentPaid({
      paymentId: payment.id,
      providerPaymentId,
      providerOrderId: remote.providerOrderId,
      source: "capture",
    });

    logger.info("Payment capture reconciled from already-captured remote", {
      module: "razorpay",
      function: "capturePayment",
      paymentId: payment.id,
      appointmentId: payment.appointmentId,
    });

    return {
      paymentId: payment.id,
      providerPaymentId,
      status: "PAID",
      captured: true,
    };
  }

  if (remote.status !== "authorized") {
    throw new RazorpayIntegrationError(
      `Payment cannot be captured in status "${remote.status}".`,
      "CAPTURE_NOT_ALLOWED",
      409,
    );
  }

  const client = getRazorpayClient();
  const started = Date.now();

  try {
    const captured = (await client.payments.capture(
      providerPaymentId,
      payment.amountPaise,
      payment.currency,
    )) as RazorpayPaymentEntity;

    logPerformance({
      kind: "external",
      operation: "razorpay.capturePayment",
      durationMs: Date.now() - started,
      module: "razorpay",
      function: "capturePayment",
      meta: { paymentId: payment.id },
    });

    await markPaymentPaid({
      paymentId: payment.id,
      providerPaymentId: captured.id || providerPaymentId,
      providerOrderId: captured.order_id ?? remote.providerOrderId,
      source: "capture",
    });

    logger.info("Payment captured", {
      module: "razorpay",
      function: "capturePayment",
      paymentId: payment.id,
      appointmentId: payment.appointmentId,
      meta: { amountPaise: payment.amountPaise },
    });

    return {
      paymentId: payment.id,
      providerPaymentId: captured.id || providerPaymentId,
      status: "PAID",
      captured: true,
    };
  } catch (error) {
    if (error instanceof RazorpayIntegrationError) {
      throw error;
    }
    logExternalServiceError("razorpay", error, {
      module: "razorpay",
      function: "capturePayment",
      paymentId: payment.id,
      durationMs: Date.now() - started,
    });
    throw new RazorpayIntegrationError(
      "Failed to capture Razorpay payment.",
      "RAZORPAY_CAPTURE_FAILED",
      502,
    );
  }
}
