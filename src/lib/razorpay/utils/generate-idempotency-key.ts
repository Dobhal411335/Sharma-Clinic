import { createHash, randomUUID } from "node:crypto";

/**
 * Generates a Razorpay-safe idempotency key (≥10 chars, [A-Za-z0-9_-]).
 * Prefer stable keys for retries (same logical operation → same key).
 */
export function generateIdempotencyKey(prefix = "rzp"): string {
  const safePrefix = prefix.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 24) || "rzp";
  return `${safePrefix}_${randomUUID().replace(/-/g, "")}`;
}

/**
 * Deterministic key for a payment attempt so double-clicks reuse the same DB row
 * before an order exists. Not sent as a Razorpay Orders API header (Orders has none).
 */
export function paymentAttemptIdempotencyKey(
  appointmentId: string,
  attemptNumber: number,
): string {
  const digest = createHash("sha256")
    .update(`payment:${appointmentId}:${attemptNumber}`)
    .digest("hex")
    .slice(0, 40);
  return `pay_${digest}`;
}

export function refundIdempotencyKey(
  paymentId: string,
  amountPaise: number,
  seed?: string,
): string {
  if (seed?.trim()) {
    const cleaned = seed.trim().replace(/[^A-Za-z0-9_-]/g, "");
    if (cleaned.length >= 10) {
      return cleaned;
    }
  }

  const digest = createHash("sha256")
    .update(`refund:${paymentId}:${amountPaise}:${seed ?? randomUUID()}`)
    .digest("hex")
    .slice(0, 40);
  return `ref_${digest}`;
}
