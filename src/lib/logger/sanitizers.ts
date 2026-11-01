/**
 * Recursive sanitization for structured logs.
 * Never log secrets, auth material, payment credentials, or patient PII.
 */

const REDACTED = "[REDACTED]";
const MASKED_EMAIL = "[EMAIL]";
const MASKED_PHONE = "[PHONE]";
const OMITTED = "[OMITTED]";

const SENSITIVE_KEY_PATTERN =
  /^(?:.*(?:password|passwd|secret|token|api[_-]?key|authorization|cookie|set-cookie|signature|cvv|upi|pin|card[_-]?number|private[_-]?key|access[_-]?token|refresh[_-]?token|webhook[_-]?secret|key[_-]?secret|auth[_-]?secret|bearer).*)$/i;

const PATIENT_BODY_KEYS = new Set([
  "patientname",
  "patientemail",
  "patientphone",
  "patient",
  "medicalnotes",
  "diagnosis",
  "prescription",
  "symptoms",
  "clinicalnotes",
  "sql",
  "query",
  "params",
  "parameters",
  "html",
  "htmlcontent",
  "textcontent",
  "body",
  "rawbody",
  "payload",
]);

const AUTH_HEADER_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-razorpay-signature",
  "x-auth-token",
]);

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
/** Indian-style and general phone numbers — mask rather than log. */
const PHONE_PATTERN =
  /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,6}\b/g;

const MAX_STRING_LENGTH = 500;
const MAX_ARRAY_LENGTH = 50;
const MAX_OBJECT_KEYS = 40;
const MAX_DEPTH = 6;

export const PINO_REDACT_PATHS = [
  "password",
  "passwd",
  "secret",
  "token",
  "apiKey",
  "api_key",
  "apiSecret",
  "api_secret",
  "authorization",
  "cookie",
  "headers.authorization",
  "headers.cookie",
  "headers.set-cookie",
  "headers.x-api-key",
  "headers.x-razorpay-signature",
  "req.headers.authorization",
  "req.headers.cookie",
  "body.password",
  "body.token",
  "body.signature",
  "body.razorpay_signature",
  "meta.password",
  "meta.token",
  "meta.apiKey",
  "meta.apiSecret",
  "meta.signature",
  "meta.webhookSecret",
  "meta.keySecret",
  "error.config.auth",
  "error.config.headers.Authorization",
] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function normalizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

export function maskEmail(value: string): string {
  return value.replace(EMAIL_PATTERN, MASKED_EMAIL);
}

export function maskPhone(value: string): string {
  return value.replace(PHONE_PATTERN, (match) => {
    const digits = match.replace(/\D/g, "");
    if (digits.length < 8) {
      return match;
    }
    return MASKED_PHONE;
  });
}

export function sanitizeString(value: string): string {
  let next = maskEmail(maskPhone(value));
  if (next.length > MAX_STRING_LENGTH) {
    next = `${next.slice(0, MAX_STRING_LENGTH)}…`;
  }
  return next;
}

function shouldRedactKey(key: string): boolean {
  if (AUTH_HEADER_KEYS.has(key.toLowerCase())) {
    return true;
  }
  if (SENSITIVE_KEY_PATTERN.test(key)) {
    return true;
  }
  return PATIENT_BODY_KEYS.has(normalizeKey(key));
}

/**
 * Recursively sanitize a value for logging.
 * Secrets become [REDACTED]; emails/phones masked; oversized payloads truncated.
 */
export function sanitizeForLogging(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (depth >= MAX_DEPTH) {
    return OMITTED;
  }

  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Error) {
    const codeValue = (value as unknown as { code?: unknown }).code;
    return {
      name: value.name,
      message: sanitizeString(value.message),
      ...(typeof codeValue === "string" ? { code: codeValue } : {}),
    };
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Buffer.isBuffer(value)) {
    return `[Buffer length=${value.length}]`;
  }

  if (Array.isArray(value)) {
    const limited = value.slice(0, MAX_ARRAY_LENGTH).map((item) =>
      sanitizeForLogging(item, depth + 1),
    );
    if (value.length > MAX_ARRAY_LENGTH) {
      limited.push(`[+${value.length - MAX_ARRAY_LENGTH} more]`);
    }
    return limited;
  }

  if (!isPlainObject(value)) {
    if (typeof value === "object" && value !== null && "toJSON" in value) {
      try {
        return sanitizeForLogging(
          (value as { toJSON: () => unknown }).toJSON(),
          depth + 1,
        );
      } catch {
        return OMITTED;
      }
    }
    return String(value);
  }

  const entries = Object.entries(value);
  const result: Record<string, unknown> = {};
  const limit = Math.min(entries.length, MAX_OBJECT_KEYS);

  for (let i = 0; i < limit; i += 1) {
    const [key, nested] = entries[i];
    if (shouldRedactKey(key)) {
      result[key] = REDACTED;
      continue;
    }
    result[key] = sanitizeForLogging(nested, depth + 1);
  }

  if (entries.length > MAX_OBJECT_KEYS) {
    result._omittedKeys = entries.length - MAX_OBJECT_KEYS;
  }

  return result;
}

/**
 * Drop empty optional LogContext fields before emitting.
 */
export function omitEmptyFields<T extends Record<string, unknown>>(
  input: T,
): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(input) as [keyof T, T[keyof T]][]) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    result[key] = value;
  }
  return result;
}

export { REDACTED, MASKED_EMAIL, MASKED_PHONE };
