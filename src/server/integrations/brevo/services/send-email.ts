import "server-only";

import { logger } from "@/lib/logger";

import { sanitizeProviderError } from "../client";
import {
  BrevoNotConfiguredError,
  BrevoSendError,
  sendTransactionalEmail,
} from "../send";
import {
  BrevoError,
  type EmailRecipient,
  type EmailSendResult,
  type SendEmailInput,
} from "../types";
import { assertRecipient } from "../utils/email-validation";

function normalizeRecipients(
  to: EmailRecipient | EmailRecipient[],
): EmailRecipient[] {
  const list = Array.isArray(to) ? to : [to];
  if (list.length === 0) {
    throw new BrevoError(
      "At least one recipient is required.",
      "MISSING_RECIPIENT",
      400,
    );
  }
  return list.map((recipient) => assertRecipient(recipient));
}

/**
 * Central transactional send adapter.
 * Uses Prisma EmailLog + Brevo via sendTransactionalEmail.
 * Email failure is independent of appointment/payment domain outcomes.
 */
export async function sendEmail(
  input: SendEmailInput,
): Promise<EmailSendResult> {
  const started = Date.now();
  try {
    const recipients = normalizeRecipients(input.to);
    const subject = input.subject.trim();
    const html = input.html.trim();
    const text = input.text.trim();

    if (!subject || !html || !text) {
      throw new BrevoError(
        "Email subject, html, and text are required.",
        "MISSING_EMAIL_CONTENT",
        400,
      );
    }

    // Primary recipient is used for EmailLog; Brevo send currently supports one.
    const primary = recipients[0];
    if (recipients.length > 1) {
      logger.warn("Brevo sendEmail currently delivers to the primary recipient only", {
        module: "brevo",
        function: "sendEmail",
        recipientCount: recipients.length,
      });
    }

    const result = await sendTransactionalEmail({
      templateKind: input.templateKind ?? "booking-received",
      toEmail: primary.email,
      toName: primary.name,
      subject,
      htmlContent: html,
      textContent: text,
      headers: input.headers,
      referenceId: input.referenceId ?? null,
      idempotencyKey: input.idempotencyKey ?? null,
    });

    logger.info("Brevo email accepted", {
      module: "brevo",
      function: "sendEmail",
      templateKind: input.templateKind,
      durationMs: Date.now() - started,
      idempotentReplay: result.idempotentReplay === true,
    });

    return {
      ok: true,
      messageId: result.providerMessageId ?? `brevo-${Date.now()}`,
      ...(result.idempotentReplay ? { idempotentReplay: true } : {}),
    };
  } catch (error) {
    if (
      !(error instanceof BrevoError) &&
      !(error instanceof BrevoNotConfiguredError) &&
      !(error instanceof BrevoSendError)
    ) {
      logger.error("Brevo send failed", {
        module: "brevo",
        function: "sendEmail",
        durationMs: Date.now() - started,
        templateKind: input.templateKind,
        errorName: error instanceof Error ? error.name : "unknown",
      });
    }

    const sanitized = sanitizeProviderError(error);
    return {
      ok: false,
      code: sanitized.code,
      message: sanitized.message,
    };
  }
}
