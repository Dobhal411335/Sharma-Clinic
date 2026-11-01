import { BrevoError } from "./types";

export interface BrevoClinicConfig {
  clinicName: string;
  clinicPhone: string;
  clinicAddress: string;
  clinicEmail: string;
  clinicTimezone: string;
  appUrl: string;
  logoUrl?: string;
}

export interface BrevoSenderConfig {
  apiKey: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
}

export interface BrevoConfig extends BrevoSenderConfig, BrevoClinicConfig {}

function readOptional(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function requireEnv(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new BrevoError(
      `Missing required environment variable: ${name}.`,
      "BREVO_CONFIG_MISSING",
      500,
    );
  }
  return trimmed;
}

function normalizeAppUrl(raw: string): string {
  const trimmed = raw.replace(/\/+$/, "");
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new BrevoError(
      "NEXT_PUBLIC_APP_URL must be a valid absolute URL.",
      "BREVO_INVALID_APP_URL",
      500,
    );
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new BrevoError(
      "NEXT_PUBLIC_APP_URL must use http or https.",
      "BREVO_INVALID_APP_URL",
      500,
    );
  }

  return trimmed;
}

/**
 * Clinic branding/contact used by templates.
 * Does not require BREVO_API_KEY so HTML can be rendered offline.
 */
export function getClinicConfig(): BrevoClinicConfig {
  const clinicName =
    readOptional("CLINIC_NAME") ||
    readOptional("BREVO_SENDER_NAME") ||
    "Sharma Clinic";
  const senderEmail = readOptional("BREVO_SENDER_EMAIL");
  const appUrlRaw =
    readOptional("NEXT_PUBLIC_APP_URL") || "http://localhost:3000";
  const appUrl = normalizeAppUrl(appUrlRaw);
  const logoUrl = readOptional("BREVO_LOGO_URL") || undefined;

  return {
    clinicName,
    clinicPhone: readOptional("CLINIC_PHONE"),
    clinicAddress: readOptional("CLINIC_ADDRESS"),
    clinicEmail: readOptional("CLINIC_EMAIL") || senderEmail,
    clinicTimezone: readOptional("CLINIC_TIMEZONE") || "Asia/Kolkata",
    appUrl,
    logoUrl,
  };
}

/**
 * Full send configuration. Validates API key + sender before network calls.
 */
export function getBrevoConfig(): BrevoConfig {
  const apiKey = requireEnv("BREVO_API_KEY", process.env.BREVO_API_KEY);
  const senderEmail = requireEnv(
    "BREVO_SENDER_EMAIL",
    process.env.BREVO_SENDER_EMAIL,
  );
  const clinic = getClinicConfig();
  const senderName =
    readOptional("BREVO_SENDER_NAME") || clinic.clinicName || "Sharma Clinic";
  const replyToEmail = readOptional("BREVO_REPLY_TO_EMAIL") || senderEmail;

  // Prefer explicitly configured app URL when sending.
  requireEnv("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL);

  return {
    apiKey,
    senderName,
    senderEmail,
    replyToEmail,
    ...clinic,
    clinicName: clinic.clinicName || senderName,
    clinicEmail: clinic.clinicEmail || senderEmail,
  };
}
