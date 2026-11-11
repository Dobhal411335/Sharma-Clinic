import {
  RazorpayIntegrationError,
  type RazorpayConfig,
} from "./types";

function requireEnv(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new RazorpayIntegrationError(
      `Missing required environment variable: ${name}.`,
      "RAZORPAY_CONFIG_MISSING",
      500,
    );
  }
  return trimmed;
}

/**
 * Server-only Razorpay credentials. Never expose keySecret or webhookSecret.
 */
export function getRazorpayConfig(): RazorpayConfig {
  const keyId = requireEnv("RAZORPAY_KEY_ID", process.env.RAZORPAY_KEY_ID);
  const keySecret = requireEnv(
    "RAZORPAY_KEY_SECRET",
    process.env.RAZORPAY_KEY_SECRET,
  );
  const webhookSecret = requireEnv(
    "RAZORPAY_WEBHOOK_SECRET",
    process.env.RAZORPAY_WEBHOOK_SECRET,
  );
  const publicKeyId =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || keyId;

  if (publicKeyId !== keyId) {
    throw new RazorpayIntegrationError(
      "NEXT_PUBLIC_RAZORPAY_KEY_ID must match RAZORPAY_KEY_ID.",
      "RAZORPAY_KEY_MISMATCH",
      500,
    );
  }

  return {
    keyId,
    keySecret,
    webhookSecret,
    publicKeyId,
  };
}

/** Public Key ID only — safe to return to Checkout. */
export function getRazorpayPublicKeyId(): string {
  return getRazorpayConfig().publicKeyId;
}
