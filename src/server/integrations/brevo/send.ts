import "server-only";

import { prisma } from "@/lib/db/prisma";
import { storefrontBaseUrl } from "@/lib/storefront-url";
import {
  createBrevoClient,
  readBrevoConfig,
} from "@/server/integrations/brevo/client";
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
      return { providerMessageId: existing.providerMessageId };
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
  const clinicName = process.env.CLINIC_NAME?.trim() || "Sharma Clinic";
  const otp = input.otp.trim();
  // Gmail/Apple detect one contiguous 6-digit code near "verification code".
  // Digit-per-box HTML does not create Gmail's Copy code chip — that chip is
  // client-side and mostly on the Gmail Android/iOS apps (not guaranteed on web).
  const subject = `${otp} is your ${clinicName} verification code`;
  const htmlContent = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#1f2937;max-width:560px;margin:0 auto;padding:24px">
      <p style="margin:0 0 12px;font-size:16px">Your ${escapeHtml(clinicName)} verification code is:</p>
      <p style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:6px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#111827">${escapeHtml(otp)}</p>
      <p style="margin:0 0 12px;color:#4b5563;font-size:14px">It expires in 10 minutes.</p>
      <p style="margin:0;color:#6b7280;font-size:13px">If you did not request this code, you can ignore this email. We will never ask you for this code by phone, chat, or email.</p>
    </div>
  `.trim();
  const textContent = [
    `Your ${clinicName} verification code is ${otp}`,
    "",
    "It expires in 10 minutes.",
    "",
    "If you did not request this code, you can ignore this email.",
  ].join("\n");

  const appOrigin = storefrontBaseUrl();
  const headers =
    appOrigin && /^https?:\/\//i.test(appOrigin)
      ? {
          // Emerging draft header; does not guarantee Gmail's UI, but is machine-readable.
          "OTP-Token": `"${otp}"; origin="${appOrigin}"`,
        }
      : undefined;

  await sendTransactionalEmail({
    templateKind: "doctor.email_verification",
    toEmail: input.toEmail,
    subject,
    htmlContent,
    textContent,
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
  const clinicName = process.env.CLINIC_NAME?.trim() || "Sharma Clinic";
  const loginUrl = `${storefrontBaseUrl() || ""}/login`.replace(/([^:]\/)\/+/g, "$1");
  const doctorName = formatDoctorDisplayName(input.toName) || "Doctor";
  const subject = `Your ${clinicName} doctor login credentials`;

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#1f2937;max-width:600px;margin:0 auto;padding:24px;background:#f8f5ee">
      <div style="background:#ffffff;border-radius:16px;padding:28px;border:1px solid #ece7df">
        <h1 style="font-size:22px;margin:0 0 8px;color:#102a43">Welcome to ${clinicName}</h1>
        <p style="margin:0 0 18px;color:#5b6b7c">Hello ${escapeHtml(doctorName)},</p>
        <p style="margin:0 0 18px">Your doctor account has been approved. Use the credentials below to sign in to your dashboard.</p>
        <div style="border:1px solid #d9e5ea;border-radius:12px;padding:16px;background:#f8fbfc;margin:0 0 22px">
          <p style="margin:0 0 8px"><strong>Login email:</strong> ${escapeHtml(input.loginEmail)}</p>
          <p style="margin:0 0 8px"><strong>Password:</strong> ${escapeHtml(input.password)}</p>
          <p style="margin:0"><strong>Passcode:</strong> ${escapeHtml(input.passcode)}</p>
        </div>
        <p style="margin:0 0 18px;color:#5b6b7c;font-size:14px">You can sign in with email and password, or with your passcode alone on the doctor login tab.</p>
        <a href="${escapeHtml(loginUrl)}" style="display:inline-block;background:#168b91;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px">Open staff login</a>
      </div>
    </div>
  `.trim();

  const textContent = [
    `Hello ${doctorName},`,
    "",
    `Your ${clinicName} doctor account has been approved.`,
    `Login email: ${input.loginEmail}`,
    `Password: ${input.password}`,
    `Passcode: ${input.passcode}`,
    `Login: ${loginUrl}`,
  ].join("\n");

  await sendTransactionalEmail({
    templateKind: "doctor.login_credentials",
    toEmail: input.toEmail,
    toName: input.toName,
    subject,
    htmlContent,
    textContent,
    referenceId: input.userId,
    idempotencyKey: `doctor-credentials:${input.userId}:${input.loginEmail}`,
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
