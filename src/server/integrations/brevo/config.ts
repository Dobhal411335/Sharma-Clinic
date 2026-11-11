import { getCompanyBasicInfo } from "@/features/company-basic-info/company-basic-info.service";
import type { CompanyBasicInfo } from "@/types/company-basic-info";

import { BrevoError } from "./types";

export interface BrevoClinicConfig {
  clinicName: string;
  clinicPhone: string;
  clinicAddress: string;
  clinicEmail: string;
  clinicTimezone: string;
  appUrl: string;
  logoUrl?: string;
  adminNotificationEmail?: string;
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

function firstNonEmpty(values: Array<string | undefined | null>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function companyLogoUrl(company: CompanyBasicInfo): string | undefined {
  // Prefer main logo for email header branding; fall back to footer logo.
  return (
    firstNonEmpty([company.mainLogo?.url, company.footerLogo?.url]) || undefined
  );
}

function mergeCompanyIntoClinicConfig(
  envConfig: BrevoClinicConfig,
  company: CompanyBasicInfo,
): BrevoClinicConfig {
  const logoFromCompany = companyLogoUrl(company);
  const phoneFromCompany = firstNonEmpty(company.contactNumbers ?? []);
  const emailFromCompany = firstNonEmpty(company.emails ?? []);
  const addressFromCompany = firstNonEmpty(company.officeAddresses ?? []);

  return {
    ...envConfig,
    clinicName:
      firstNonEmpty([company.companyName, envConfig.clinicName]) ||
      "Sharma Clinic",
    // Contact details come from company basic info only (not env).
    clinicPhone: phoneFromCompany,
    clinicAddress: addressFromCompany,
    clinicEmail: firstNonEmpty([emailFromCompany, envConfig.clinicEmail]),
    logoUrl: logoFromCompany || envConfig.logoUrl,
    adminNotificationEmail:
      envConfig.adminNotificationEmail || emailFromCompany || undefined,
  };
}

/**
 * Env-only clinic branding (sync). Contact phone/address come from company
 * basic info at runtime; env only supplies name/timezone/app URL fallbacks.
 */
export function getClinicConfigFromEnv(): BrevoClinicConfig {
  const clinicName =
    readOptional("CLINIC_NAME") ||
    readOptional("BREVO_SENDER_NAME") ||
    "Sharma Clinic";
  const senderEmail = readOptional("BREVO_SENDER_EMAIL");
  const appUrlRaw =
    readOptional("NEXT_PUBLIC_APP_URL") || "http://localhost:3000";
  const appUrl = normalizeAppUrl(appUrlRaw);
  const logoUrl = readOptional("BREVO_LOGO_URL") || undefined;
  const adminNotificationEmail =
    readOptional("ADMIN_NOTIFICATION_EMAIL") || undefined;

  return {
    clinicName,
    clinicPhone: "",
    clinicAddress: "",
    clinicEmail: senderEmail,
    clinicTimezone: readOptional("CLINIC_TIMEZONE") || "Asia/Kolkata",
    appUrl,
    logoUrl,
    adminNotificationEmail,
  };
}

/**
 * Clinic branding/contact for email header/footer.
 * Phone, address, and public email come from saved Company Basic Info.
 * Unsaved CMS fallback placeholders are ignored so emails keep env name/sender.
 */
export async function getClinicConfig(): Promise<BrevoClinicConfig> {
  const envConfig = getClinicConfigFromEnv();
  try {
    const company = await getCompanyBasicInfo();
    // FALLBACK_COMPANY_BASIC_INFO uses id: null until an admin saves company info.
    if (!company.id) {
      return envConfig;
    }
    return mergeCompanyIntoClinicConfig(envConfig, company);
  } catch {
    return envConfig;
  }
}

/**
 * Full send configuration. Validates API key + sender before network calls.
 */
export async function getBrevoConfig(): Promise<BrevoConfig> {
  const apiKey = requireEnv("BREVO_API_KEY", process.env.BREVO_API_KEY);
  const senderEmail = requireEnv(
    "BREVO_SENDER_EMAIL",
    process.env.BREVO_SENDER_EMAIL,
  );
  const clinic = await getClinicConfig();
  const senderName =
    readOptional("BREVO_SENDER_NAME") || clinic.clinicName || "Sharma Clinic";
  const replyToEmail = readOptional("BREVO_REPLY_TO_EMAIL") || senderEmail;

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
