import { getRazorpayConfig } from "../config";
import {
  RazorpayIntegrationError,
  type RazorpayWebhookPayload,
} from "../types";
import { assertWebhookSignature } from "../utils/verify-signature";

export function verifyWebhookRequest(input: {
  rawBody: string | Buffer;
  signatureHeader: string | null;
}): RazorpayWebhookPayload {
  const signature = input.signatureHeader?.trim();
  if (!signature) {
    throw new RazorpayIntegrationError(
      "Missing x-razorpay-signature header.",
      "WEBHOOK_SIGNATURE_MISSING",
      400,
    );
  }

  const { webhookSecret } = getRazorpayConfig();
  assertWebhookSignature({
    rawBody: input.rawBody,
    signature,
    webhookSecret,
  });

  const raw =
    typeof input.rawBody === "string"
      ? input.rawBody
      : input.rawBody.toString("utf8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new RazorpayIntegrationError(
      "Webhook body is not valid JSON.",
      "WEBHOOK_INVALID_JSON",
      400,
    );
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof (parsed as RazorpayWebhookPayload).event !== "string"
  ) {
    throw new RazorpayIntegrationError(
      "Webhook payload is missing event.",
      "WEBHOOK_INVALID_PAYLOAD",
      400,
    );
  }

  return parsed as RazorpayWebhookPayload;
}
