import { DEFAULT_TOAST_FALLBACK } from "./toast.config";

const MAX_TOAST_MESSAGE_LENGTH = 180;

const UNSAFE_PATTERNS: RegExp[] = [
  /at\s+\S+\s+\(/i, // stack frame
  /\bstack(?:\s*trace)?\b/i,
  /\binternal server error\b/i,
  /<\/?[a-z][\s\S]*>/i, // HTML
  // Likely secret leakage — not ordinary phrases like "Invalid email or password"
  /\b(?:password|passwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|otp)\s*[:=]\s*\S+/i,
  /\bbearer\s+[a-z0-9._\-]+=*/i,
  /\bECONNREFUSED\b/i,
  /\bPrisma\b/,
  /\bSQLSTATE\b/i,
  /\/[\w.-]+\.(?:ts|js|tsx|jsx):\d+/i, // file:line
];

/**
 * Returns a concise user-facing toast message.
 * Rejects stack traces, HTML, and sensitive-looking content.
 */
export function sanitizeUserMessage(
  message: unknown,
  fallback: string = DEFAULT_TOAST_FALLBACK,
): string {
  if (typeof message !== "string") {
    return fallback;
  }

  const trimmed = message.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return fallback;
  }

  if (trimmed.length > MAX_TOAST_MESSAGE_LENGTH) {
    return fallback;
  }

  if (trimmed.includes("\n") && /error|exception|trace/i.test(trimmed)) {
    return fallback;
  }

  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return fallback;
    }
  }

  return trimmed;
}
