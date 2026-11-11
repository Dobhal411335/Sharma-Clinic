import "server-only";

import { prisma } from "@/lib/db/prisma";
import { storefrontBaseUrl } from "@/lib/storefront-url";
import {
  createBrevoClient,
  readBrevoConfig,
} from "@/server/integrations/brevo/client";
import { getClinicConfig } from "@/server/integrations/brevo/config";
import { EMAIL_THEME } from "@/server/integrations/brevo/theme";
import { escapeHtml, sanitizeText } from "@/server/integrations/brevo/utils/html";
import {
  closingHtml,
  greetingHtml,
  renderWithLayout,
} from "@/server/integrations/brevo/utils/render-email";
import { highlightBox, primaryButton } from "@/server/integrations/brevo/templates/shared/layout";
import { formatDoctorDisplayName } from "@/types/doctors";

export class BrevoNotConfiguredError extends Error {
  constructor() {
    super("Email sending is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL.");
    this.name = "BrevoNotConfiguredError";
  }
}

export class BrevoSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BrevoSendError";
  }
}

function formatBrevoError(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Email send failed";

  if (/permission_denied|not authorized for resource .*transactional\.email/i.test(raw)) {
    return (
      "Brevo API key is not authorized for transactional email. " +
      "In Brevo → SMTP & API → API keys, create a key with Transactional email permission " +
      "(or enable that permission on the current key), then update BREVO_API_KEY."
    );
  }

  const bodyMatch = raw.match(/Body:\s*(\{[\s\S]*\})\s*$/i);
  if (bodyMatch?.[1]) {
    try {
      const parsed = JSON.parse(bodyMatch[1]) as { message?: string; code?: string };
      if (parsed.message) {
        return `Brevo email failed: ${parsed.message}`;
      }
    } catch {
      // fall through
    }
  }

  return raw.slice(0, 500);
}

type SendEmailInput = {
  templateKind: string;
  toEmail: string;
  toName?: string | null;
  subject: string;
  htmlContent: string;
  textContent: string;
  headers?: Record<string, string>;
  referenceId?: string | null;
  idempotencyKey?: string | null;
};

export async function sendTransactionalEmail(input: SendEmailInput): Promise<{
  providerMessageId: string | null;
  idempotentReplay?: boolean;
}> {
  const config = readBrevoConfig();
  if (!config) {
    throw new BrevoNotConfiguredError();
  }

  if (input.idempotencyKey) {
    const existing = await prisma.emailLog.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      select: { status: true, providerMessageId: true },
    });
    if (existing?.status === "SENT") {
      return {
        providerMessageId: existing.providerMessageId,
        idempotentReplay: true,
      };
    }
  }

  const log = await prisma.emailLog.create({
    data: {
      templateKind: input.templateKind,
      recipientEmail: input.toEmail.toLowerCase(),
      recipientName: input.toName?.trim() || null,
      subject: input.subject,
      status: "PENDING",
      provider: "BREVO",
      referenceId: input.referenceId ?? null,
      idempotencyKey: input.idempotencyKey ?? null,
    },
  });

  try {
    const client = createBrevoClient(config.apiKey);
    const response = await client.transactionalEmails.sendTransacEmail({
      sender: { email: config.senderEmail, name: config.senderName },
      to: [
        {
          email: input.toEmail,
          ...(input.toName?.trim() ? { name: input.toName.trim() } : {}),
        },
      ],
      subject: input.subject,
      htmlContent: input.htmlContent,
      textContent: input.textContent,
      ...(input.headers && Object.keys(input.headers).length > 0
        ? { headers: input.headers }
        : {}),
      ...(config.replyToEmail
        ? { replyTo: { email: config.replyToEmail } }
        : {}),
    });

    const providerMessageId =
      typeof response.messageId === "string" ? response.messageId : null;

    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: "SENT",
        providerMessageId,
        sentAt: new Date(),
      },
    });

    return { providerMessageId };
  } catch (error) {
    const message = formatBrevoError(error);
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        errorCode:
          /permission_denied/i.test(String(error instanceof Error ? error.message : ""))
            ? "permission_denied"
            : null,
        errorMessage: message.slice(0, 500),
      },
    });
    throw new BrevoSendError(message);
  }
}

export async function sendDoctorEmailVerificationOtp(input: {
  toEmail: string;
  otp: string;
}): Promise<void> {
  const config = await getClinicConfig();
  const otp = input.otp.trim();
  // Gmail/Apple detect one contiguous 6-digit code near "verification code".
  const subject = `${otp} is your ${config.clinicName} verification code`;

  const htmlBody = `
    <p style="margin:0 0 12px 0;font-family:${EMAIL_THEME.fontFamily};font-size:16px;color:${EMAIL_THEME.text};">Your ${escapeHtml(config.clinicName)} verification code is:</p>
    <p style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:6px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:${EMAIL_THEME.text};">${escapeHtml(otp)}</p>
    ${highlightBox("It expires in <strong>10 minutes</strong>.")}
    <p style="margin:16px 0 0 0;color:${EMAIL_THEME.muted};font-size:13px;">If you did not request this code, you can ignore this email. We will never ask you for this code by phone, chat, or email.</p>
  `.trim();

  const textBody = [
    `Your ${config.clinicName} verification code is ${otp}`,
    "",
    "It expires in 10 minutes.",
    "",
    "If you did not request this code, you can ignore this email.",
  ].join("\n");

  const rendered = await renderWithLayout(
    {
      title: "Verification code",
      preheader: `Your ${config.clinicName} verification code.`,
      htmlBody,
      textBody,
    },
    subject,
    config,
  );

  const appOrigin = storefrontBaseUrl();
  const headers =
    appOrigin && /^https?:\/\//i.test(appOrigin)
      ? {
          "OTP-Token": `"${otp}"; origin="${appOrigin}"`,
        }
      : undefined;

  await sendTransactionalEmail({
    templateKind: "doctor.email_verification",
    toEmail: input.toEmail,
    subject: rendered.subject,
    htmlContent: rendered.html,
    textContent: rendered.text,
    headers,
  });
}

export async function sendDoctorLoginCredentialsEmail(input: {
  toEmail: string;
  toName: string;
  loginEmail: string;
  password: string;
  passcode: string;
  userId: string;
}): Promise<void> {
  const config = await getClinicConfig();
  const loginUrl = `${storefrontBaseUrl() || config.appUrl}/login`.replace(
    /([^:]\/)\/+/g,
    "$1",
  );
  const doctorName = formatDoctorDisplayName(input.toName) || "Doctor";
  const subject = `Your ${config.clinicName} doctor login credentials`;

  const htmlBody = `
    ${greetingHtml(escapeHtml(doctorName))}
    <p style="margin:0 0 12px 0;">Your doctor account has been approved. Use the credentials below to sign in to your dashboard.</p>
    ${highlightBox(
      [
        `<p style="margin:0 0 8px"><strong>Login email:</strong> ${escapeHtml(input.loginEmail)}</p>`,
        `<p style="margin:0 0 8px"><strong>Password:</strong> ${escapeHtml(input.password)}</p>`,
        `<p style="margin:0"><strong>Passcode:</strong> ${escapeHtml(input.passcode)}</p>`,
      ].join(""),
    )}
    <p style="margin:0 0 12px;color:${EMAIL_THEME.muted};font-size:14px;">You can sign in with email and password, or with your passcode alone on the doctor login tab.</p>
    ${primaryButton("Open staff login", loginUrl)}
    ${closingHtml(escapeHtml(config.clinicName))}
  `.trim();

  const textBody = [
    `Hello ${sanitizeText(doctorName)},`,
    "",
    `Your ${config.clinicName} doctor account has been approved.`,
    `Login email: ${input.loginEmail}`,
    `Password: ${input.password}`,
    `Passcode: ${input.passcode}`,
    `Login: ${loginUrl}`,
  ].join("\n");

  const rendered = await renderWithLayout(
    {
      title: "Doctor login credentials",
      preheader: `Your ${config.clinicName} doctor account is ready.`,
      htmlBody,
      textBody,
    },
    subject,
    config,
  );

  await sendTransactionalEmail({
    templateKind: "doctor.login_credentials",
    toEmail: input.toEmail,
    toName: input.toName,
    subject: rendered.subject,
    htmlContent: rendered.html,
    textContent: rendered.text,
    referenceId: input.userId,
    idempotencyKey: `doctor-credentials:${input.userId}:${input.loginEmail}`,
  });
}
