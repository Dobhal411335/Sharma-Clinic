import "server-only";

import { BrevoClient } from "@getbrevo/brevo";

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
