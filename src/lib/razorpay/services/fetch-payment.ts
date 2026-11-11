import {
  logExternalServiceError,
  logPerformance,
} from "@/lib/logger";

import { getRazorpayClient } from "../client";
import {
  FetchPaymentResult,
  RazorpayIntegrationError,
  type RazorpayPaymentEntity,
} from "../types";

function asBooleanCaptured(value: RazorpayPaymentEntity["captured"]): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value === 1;
  }
  if (typeof value === "string") {
    return value === "1" || value.toLowerCase() === "true";
  }
  return false;
}

/**
 * Fetches a payment from Razorpay by provider payment id.
 */
export async function fetchPayment(
  providerPaymentId: string,
): Promise<FetchPaymentResult> {
  const trimmed = providerPaymentId?.trim();
  if (!trimmed) {
    throw new RazorpayIntegrationError(
      "providerPaymentId is required.",
      "PROVIDER_PAYMENT_ID_REQUIRED",
    );
  }

  const client = getRazorpayClient();
  const started = Date.now();

  try {
    const payment = (await client.payments.fetch(
      trimmed,
    )) as RazorpayPaymentEntity;

    logPerformance({
      kind: "external",
      operation: "razorpay.fetchPayment",
      durationMs: Date.now() - started,
      module: "razorpay",
      function: "fetchPayment",
    });

    if (!payment?.id || typeof payment.amount !== "number") {
      throw new RazorpayIntegrationError(
        "Razorpay returned an incomplete payment.",
        "RAZORPAY_INCOMPLETE_PAYMENT",
        502,
      );
    }

    return {
      providerPaymentId: payment.id,
      providerOrderId: payment.order_id,
      amountPaise: payment.amount,
      currency: payment.currency,
      status: payment.status,
      captured: asBooleanCaptured(payment.captured),
      amountRefundedPaise: payment.amount_refunded ?? 0,
    };
  } catch (error) {
    if (error instanceof RazorpayIntegrationError) {
      throw error;
    }
    logExternalServiceError("razorpay", error, {
      module: "razorpay",
      function: "fetchPayment",
      durationMs: Date.now() - started,
    });
    throw new RazorpayIntegrationError(
      "Failed to fetch Razorpay payment.",
      "RAZORPAY_FETCH_PAYMENT_FAILED",
      502,
    );
  }
}
