import { BrevoClient } from "@getbrevo/brevo";

import { getBrevoConfig } from "./config";
import { BrevoError } from "./types";

let client: BrevoClient | null = null;
let configuredApiKey: string | null = null;

/**
 * Lazily initializes a server-only Brevo client.
 * Never import this module from Client Components.
 */
export function getBrevoClient(): BrevoClient {
  const { apiKey } = getBrevoConfig();

  if (!client || configuredApiKey !== apiKey) {
    client = new BrevoClient({ apiKey });
    configuredApiKey = apiKey;
  }

  return client;
}

/**
 * Sanitizes provider / unexpected errors for callers.
 * Never expose API keys or raw Brevo payloads to the frontend.
 */
export function sanitizeProviderError(error: unknown): {
  code: string;
  message: string;
  statusCode: number;
} {
  if (error instanceof BrevoError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  return {
    code: "BREVO_SEND_FAILED",
    message: "Transactional email could not be sent.",
    statusCode: 502,
  };
}
