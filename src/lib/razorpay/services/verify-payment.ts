import { db } from "@/lib/db/prisma";
import { logAuditEvent, logger } from "@/lib/logger";

import { getRazorpayConfig } from "../config";
import {
  RazorpayIntegrationError,
  type VerifyPaymentInput,
  type VerifyPaymentResult,
} from "../types";
import { assertPaymentSignature } from "../utils/verify-signature";
import { fetchPayment } from "./fetch-payment";
import { markPaymentPaid } from "./mark-paid";

/**
 * Verifies Checkout payment signature, cross-checks amount/currency/order,
 * optionally fetches Razorpay payment, then transactionally marks PAID.
 * Idempotent for repeated successful verifies.
 * Never logs signatures or key secrets.
 */
export async function verifyPayment(
  input: VerifyPaymentInput,
): Promise<VerifyPaymentResult> {
  const orderId = input.razorpay_order_id?.trim();
  const providerPaymentId = input.razorpay_payment_id?.trim();
  const signature = input.razorpay_signature?.trim();

  if (!orderId || !providerPaymentId || !signature) {
    throw new RazorpayIntegrationError(
      "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.",
      "VERIFY_PAYLOAD_INVALID",
    );
  }

  const { keySecret } = getRazorpayConfig();
  assertPaymentSignature({
    orderId,
    paymentId: providerPaymentId,
    signature,
    keySecret,
  });

  const payment = await db.payment.findFirst({
    where: { providerOrderId: orderId },
  });

  if (!payment) {
    throw new RazorpayIntegrationError(
      "Payment order not found.",
      "PAYMENT_ORDER_NOT_FOUND",
      404,
    );
  }

  if (payment.status === "PAID") {
    if (
      payment.providerPaymentId &&
      payment.providerPaymentId !== providerPaymentId
    ) {
      logger.warn("Duplicate verify with different provider payment id", {
        module: "razorpay",
        function: "verifyPayment",
        paymentId: payment.id,
        appointmentId: payment.appointmentId,
        meta: { orderId, duplicateDetected: true },
      });
      await db.payment.update({
        where: { id: payment.id },
        data: {
          needsReconciliation: true,
          reconciliationNote: `Duplicate verify with different providerPaymentId=${providerPaymentId}.`,
        },
      });
    } else {
      logger.info("Payment verify idempotent replay", {
        module: "razorpay",
        function: "verifyPayment",
        paymentId: payment.id,
        appointmentId: payment.appointmentId,
        meta: { orderId, alreadyVerified: true },
      });
    }

    return {
      paymentId: payment.id,
      appointmentId: payment.appointmentId,
      status: "PAID",
      amountPaise: payment.amountPaise,
      currency: payment.currency,
      alreadyVerified: true,
    };
  }

  const remote = await fetchPayment(providerPaymentId);

  if (remote.providerOrderId && remote.providerOrderId !== orderId) {
    throw new RazorpayIntegrationError(
      "Payment order mismatch.",
      "ORDER_MISMATCH",
      409,
    );
  }

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

  const captured =
    remote.captured ||
    remote.status === "captured" ||
    remote.status === "authorized";

  if (!captured && remote.status === "failed") {
    throw new RazorpayIntegrationError(
      "Payment failed at provider.",
      "PAYMENT_FAILED_AT_PROVIDER",
      402,
    );
  }

  if (!captured) {
    throw new RazorpayIntegrationError(
      "Payment is not captured yet.",
      "PAYMENT_NOT_CAPTURED",
      409,
    );
  }

  const marked = await markPaymentPaid({
    paymentId: payment.id,
    providerPaymentId,
    providerOrderId: orderId,
    source: "verify",
  });

  logger.info("Payment verified", {
    module: "razorpay",
    function: "verifyPayment",
    paymentId: marked.payment.id,
    appointmentId: marked.payment.appointmentId,
    meta: {
      orderId,
      status: marked.payment.status,
      alreadyVerified: marked.alreadyPaid,
      amountPaise: marked.payment.amountPaise,
    },
  });

  if (!marked.alreadyPaid) {
    void logAuditEvent({
      action: "payment.verified",
      entityType: "Payment",
      entityId: marked.payment.id,
      metadata: {
        appointmentId: marked.payment.appointmentId,
        amountPaise: marked.payment.amountPaise,
        currency: marked.payment.currency,
      },
    });
  }

  return {
    paymentId: marked.payment.id,
    appointmentId: marked.payment.appointmentId,
    status: marked.payment.status,
    amountPaise: marked.payment.amountPaise,
    currency: marked.payment.currency,
    alreadyVerified: marked.alreadyPaid,
  };
}
