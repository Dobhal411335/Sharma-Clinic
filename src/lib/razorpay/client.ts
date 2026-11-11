import Razorpay from "razorpay";

import { getRazorpayConfig } from "./config";
import { RazorpayIntegrationError } from "./types";

let client: Razorpay | null = null;
let configuredKeyId: string | null = null;

/**
 * Lazily initializes the official Razorpay Node SDK.
 * Never import this module from Client Components.
 */
export function getRazorpayClient(): Razorpay {
  const { keyId, keySecret } = getRazorpayConfig();

  if (!client || configuredKeyId !== keyId) {
    client = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    configuredKeyId = keyId;
  }

  return client;
}

/**
 * Sanitizes provider / unexpected errors for API callers.
 * Never expose secrets or raw Razorpay payloads to the browser.
 */
export function sanitizeProviderError(error: unknown): {
  code: string;
  message: string;
  statusCode: number;
} {
  if (error instanceof RazorpayIntegrationError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  return {
    code: "RAZORPAY_REQUEST_FAILED",
    message: "Payment provider request failed.",
    statusCode: 502,
  };
}

/** Test helper — clears the cached SDK instance. */
export function resetRazorpayClientForTests(): void {
  client = null;
  configuredKeyId = null;
}
