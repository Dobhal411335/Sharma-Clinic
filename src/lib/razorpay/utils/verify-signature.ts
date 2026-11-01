import { createHmac, timingSafeEqual } from "node:crypto";

import { RazorpayIntegrationError } from "../types";

function safeCompare(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

/**
 * Verifies Checkout payment signature:
 * HMAC_SHA256(orderId|paymentId, key_secret)
 */
export function verifyPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): boolean {
  const payload = `${input.orderId}|${input.paymentId}`;
  const expected = createHmac("sha256", input.keySecret)
    .update(payload)
    .digest("hex");

  return safeCompare(expected, input.signature);
}

export function assertPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): void {
  if (!verifyPaymentSignature(input)) {
    throw new RazorpayIntegrationError(
      "Invalid payment signature.",
      "INVALID_PAYMENT_SIGNATURE",
      400,
    );
  }
}

/**
 * Verifies webhook HMAC SHA256 against the RAW request body.
 * Must run before JSON.parse.
 */
export function verifyWebhookSignature(input: {
  rawBody: string | Buffer;
  signature: string;
  webhookSecret: string;
}): boolean {
  const body =
    typeof input.rawBody === "string"
      ? input.rawBody
      : input.rawBody.toString("utf8");

  const expected = createHmac("sha256", input.webhookSecret)
    .update(body)
    .digest("hex");

  return safeCompare(expected, input.signature);
}

export function assertWebhookSignature(input: {
  rawBody: string | Buffer;
  signature: string;
  webhookSecret: string;
}): void {
  if (!verifyWebhookSignature(input)) {
    throw new RazorpayIntegrationError(
      "Invalid webhook signature.",
      "INVALID_WEBHOOK_SIGNATURE",
      400,
    );
  }
}
