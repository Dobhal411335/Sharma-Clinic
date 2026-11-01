import { BrevoError, type EmailRecipient } from "../types";

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 254) {
    return false;
  }
  return EMAIL_PATTERN.test(trimmed);
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function assertValidEmail(
  value: string,
  fieldName = "email",
): string {
  const trimmed = value.trim();
  if (!isValidEmail(trimmed)) {
    throw new BrevoError(
      `Invalid ${fieldName}.`,
      "INVALID_EMAIL",
      400,
    );
  }
  return normalizeEmail(trimmed);
}

export function assertRecipient(recipient: EmailRecipient): EmailRecipient {
  const email = assertValidEmail(recipient.email, "recipient email");
  const name = recipient.name?.trim();
  return name ? { email, name } : { email };
}

export function assertRequiredString(
  value: string | undefined | null,
  fieldName: string,
): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new BrevoError(
      `Missing required field: ${fieldName}.`,
      "MISSING_REQUIRED_FIELD",
      400,
    );
  }
  return trimmed;
}

/**
 * Validates absolute URLs used in emails.
 * Prefer HTTPS. Relative paths are resolved against the trusted app URL.
 */
export function assertTrustedUrl(
  rawUrl: string,
  appUrl: string,
  fieldName: string,
): string {
  const trimmed = assertRequiredString(rawUrl, fieldName);
  let parsed: URL;

  try {
    parsed = new URL(trimmed, appUrl);
  } catch {
    throw new BrevoError(
      `Invalid ${fieldName}.`,
      "INVALID_URL",
      400,
    );
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new BrevoError(
      `Invalid ${fieldName} protocol.`,
      "INVALID_URL",
      400,
    );
  }

  const app = new URL(appUrl);
  const isAppOrigin =
    parsed.origin === app.origin ||
    parsed.hostname === app.hostname;

  // Allow absolute app URLs and https links; block javascript: etc. already.
  // Prefer trusted app origin; still allow https external receipt links.
  if (!isAppOrigin && parsed.protocol !== "https:") {
    throw new BrevoError(
      `Untrusted ${fieldName}.`,
      "UNTRUSTED_URL",
      400,
    );
  }

  return parsed.toString();
}

export function assertPositivePaise(amountPaise: number): number {
  if (!Number.isInteger(amountPaise) || amountPaise < 0) {
    throw new BrevoError(
      "Amount must be a non-negative integer in paise.",
      "INVALID_AMOUNT",
      400,
    );
  }
  return amountPaise;
}
