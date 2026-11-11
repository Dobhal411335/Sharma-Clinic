import "server-only";

import { BrevoClient } from "@getbrevo/brevo";

import { BrevoError } from "./types";

export type BrevoSenderConfig = {
  apiKey: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string | null;
};

export function readBrevoConfig(): BrevoSenderConfig | null {
  const apiKey = process.env.BREVO_API_KEY?.trim() ?? "";
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() ?? "";
  const senderName =
    process.env.BREVO_SENDER_NAME?.trim() ||
    process.env.CLINIC_NAME?.trim() ||
    "Sharma Clinic";
  const replyToEmail = process.env.BREVO_REPLY_TO_EMAIL?.trim() || null;

  if (!apiKey || !senderEmail) {
    return null;
  }

  return { apiKey, senderName, senderEmail, replyToEmail };
}

export function createBrevoClient(apiKey: string): BrevoClient {
  return new BrevoClient({ apiKey });
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

  if (error instanceof Error) {
    if (error.name === "BrevoNotConfiguredError") {
      return {
        code: "BREVO_NOT_CONFIGURED",
        message: error.message,
        statusCode: 503,
      };
    }
    if (error.name === "BrevoSendError") {
      return {
        code: "BREVO_SEND_FAILED",
        message: error.message.slice(0, 300),
        statusCode: 502,
      };
    }
  }

  return {
    code: "BREVO_SEND_FAILED",
    message: "Transactional email could not be sent.",
    statusCode: 502,
  };
}
