import {
  logExternalServiceError,
  logPerformance,
  logger,
} from "@/lib/logger";

import { getBrevoClient, sanitizeProviderError } from "../client";
import { getBrevoConfig } from "../config";
import {
  getIdempotentResult,
  rememberIdempotentResult,
} from "../idempotency";
import {
  BrevoError,
  type EmailLogRecord,
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

function buildEmailLogDraft(
  input: SendEmailInput,
  recipients: EmailRecipient[],
  status: EmailLogRecord["status"],
  extras: Partial<EmailLogRecord> = {},
): EmailLogRecord {
  const now = new Date();
  return {
    templateKind: input.templateKind ?? "booking-received",
    recipientEmail: recipients[0].email,
    recipientName: recipients[0].name ?? null,
    subject: input.subject,
    status,
    provider: "brevo",
    providerMessageId: extras.providerMessageId ?? null,
    idempotencyKey: input.idempotencyKey ?? null,
    errorCode: extras.errorCode ?? null,
    errorMessage: extras.errorMessage ?? null,
    metadata: extras.metadata ?? null,
    createdAt: now,
    updatedAt: now,
    ...extras,
  };
}

/**
 * Central transactional send adapter.
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

    if (input.idempotencyKey) {
      const existing = getIdempotentResult(input.idempotencyKey);
      if (existing) {
        // Future: persist EmailLog with skipped_duplicate via buildEmailLogDraft.
        void buildEmailLogDraft(input, recipients, "skipped_duplicate", {
          providerMessageId: existing.messageId,
        });
        logger.debug("Brevo send skipped (idempotent replay)", {
          module: "brevo",
          function: "sendEmail",
          meta: {
            templateKind: input.templateKind,
            recipientCount: recipients.length,
          },
        });
        return {
          ok: true,
          messageId: existing.messageId,
          idempotentReplay: true,
        };
      }
    }

    const config = getBrevoConfig();
    const client = getBrevoClient();
    const replyTo = input.replyTo
      ? assertRecipient(input.replyTo)
      : {
          email: config.replyToEmail,
          name: config.senderName,
        };

    const headers: Record<string, string> = {};
    if (input.idempotencyKey) {
      headers.IdempotencyKey = input.idempotencyKey;
    }

    const response = await client.transactionalEmails.sendTransacEmail({
      sender: {
        email: config.senderEmail,
        name: config.senderName,
      },
      to: recipients.map((r) =>
        r.name ? { email: r.email, name: r.name } : { email: r.email },
      ),
      replyTo: {
        email: replyTo.email,
        ...(replyTo.name ? { name: replyTo.name } : {}),
      },
      subject,
      htmlContent: html,
      textContent: text,
      ...(input.tags && input.tags.length > 0 ? { tags: input.tags } : {}),
      ...(Object.keys(headers).length > 0 ? { headers } : {}),
    });

    const messageId =
      response.messageId ||
      response.messageIds?.[0] ||
      `brevo-${Date.now()}`;

    if (input.idempotencyKey) {
      rememberIdempotentResult(input.idempotencyKey, messageId);
    }

    void buildEmailLogDraft(input, recipients, "sent", {
      providerMessageId: messageId,
    });

    logPerformance({
      kind: "external",
      operation: "brevo.sendEmail",
      durationMs: Date.now() - started,
      module: "brevo",
      meta: {
        templateKind: input.templateKind,
        recipientCount: recipients.length,
      },
    });
    logger.info("Brevo email sent", {
      module: "brevo",
      function: "sendEmail",
      meta: {
        templateKind: input.templateKind,
        recipientCount: recipients.length,
        // Do not log recipient emails / HTML bodies.
      },
    });

    return { ok: true, messageId };
  } catch (error) {
    logExternalServiceError("brevo", error, {
      module: "brevo",
      function: "sendEmail",
      durationMs: Date.now() - started,
      meta: { templateKind: input.templateKind },
    });
    const sanitized = sanitizeProviderError(error);
    return {
      ok: false,
      code: sanitized.code,
      message: sanitized.message,
    };
  }
}
