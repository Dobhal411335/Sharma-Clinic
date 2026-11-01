import { getRequestId } from "./context";
import { logger } from "./logger";
import { sanitizeForLogging } from "./sanitizers";
import type {
  ExternalServiceName,
  LogErrorOptions,
  NormalizedError,
} from "./types";

function readStringProp(error: object, key: string): string | undefined {
  if (!(key in error)) {
    return undefined;
  }
  const value = (error as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

function readNumberProp(error: object, key: string): number | undefined {
  if (!(key in error)) {
    return undefined;
  }
  const value = (error as Record<string, unknown>)[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/**
 * Normalize Prisma / Razorpay / Cloudinary / Brevo / Zod / generic errors
 * into safe codes suitable for logs (never raw SQL or provider secrets).
 */
export function normalizeError(error: unknown): NormalizedError {
  if (error == null) {
    return {
      name: "UnknownError",
      message: "Unknown error",
      code: "UNKNOWN_ERROR",
    };
  }

  if (typeof error === "string") {
    return {
      name: "Error",
      message: error.slice(0, 500),
      code: "STRING_ERROR",
    };
  }

  if (!(error instanceof Error) && typeof error === "object") {
    const code = readStringProp(error, "code") ?? "UNKNOWN_ERROR";
    const message =
      readStringProp(error, "message") ?? "Unexpected non-Error throw";
    return {
      name: readStringProp(error, "name") ?? "ObjectError",
      message: message.slice(0, 500),
      code,
      statusCode: readNumberProp(error, "statusCode"),
    };
  }

  if (!(error instanceof Error)) {
    return {
      name: "UnknownError",
      message: String(error).slice(0, 500),
      code: "UNKNOWN_ERROR",
    };
  }

  const name = error.name || "Error";
  const message = error.message.slice(0, 500);
  const stack = error.stack;

  // Named integration errors from our adapters
  if (
    name === "CloudinaryError" ||
    name === "BrevoError" ||
    name === "RazorpayIntegrationError"
  ) {
    return {
      name,
      message,
      code: readStringProp(error, "code") ?? name.toUpperCase(),
      stack,
      statusCode: readNumberProp(error, "statusCode"),
    };
  }

  // Prisma Client errors (P2xxx / PrismaClient*Error)
  if (
    name.startsWith("Prisma") ||
    (typeof readStringProp(error, "code") === "string" &&
      /^P\d{4}$/.test(readStringProp(error, "code") ?? ""))
  ) {
    const prismaCode = readStringProp(error, "code");
    return {
      name,
      message: "Database operation failed.",
      code: prismaCode ? `PRISMA_${prismaCode}` : "PRISMA_ERROR",
      stack,
      statusCode: 500,
    };
  }

  // Zod validation
  if (name === "ZodError") {
    return {
      name,
      message: "Validation failed.",
      code: "VALIDATION_ERROR",
      stack,
      statusCode: 400,
    };
  }

  // Razorpay SDK-ish errors
  if (
    name.toLowerCase().includes("razorpay") ||
    readStringProp(error, "error") === "BAD_REQUEST_ERROR"
  ) {
    return {
      name,
      message: "Payment provider request failed.",
      code: readStringProp(error, "code") ?? "RAZORPAY_REQUEST_FAILED",
      stack,
      statusCode: 502,
    };
  }

  const code =
    readStringProp(error, "code") ??
    readStringProp(error, "errorCode") ??
    "INTERNAL_ERROR";

  return {
    name,
    message,
    code,
    stack,
    statusCode: readNumberProp(error, "statusCode"),
  };
}

/**
 * Log an error with stack + correlation fields. Does not swallow —
 * rethrows when `options.rethrow` is true (default false for explicit calls).
 */
export function logError(error: unknown, options: LogErrorOptions = {}): NormalizedError {
  const normalized = normalizeError(error);
  const requestId = getRequestId();

  try {
    logger.error(normalized.message, {
      module: options.module,
      function: options.function,
      file: options.file,
      api: options.endpoint,
      appointmentId: options.appointmentId,
      paymentId: options.paymentId,
      doctorId: options.doctorId,
      userId: options.userId,
      durationMs: options.durationMs,
      errorCode: normalized.code,
      errorName: normalized.name,
      requestId,
      stack: normalized.stack,
      ...(options.meta
        ? { meta: sanitizeForLogging(options.meta) as Record<string, unknown> }
        : {}),
    });
  } catch {
    // never crash
  }

  if (options.rethrow) {
    throw error;
  }

  return normalized;
}

export function logDatabaseError(
  error: unknown,
  options: LogErrorOptions & { operation?: string } = {},
): NormalizedError {
  return logError(error, {
    ...options,
    module: options.module ?? "database",
    function: options.function ?? options.operation,
    meta: {
      ...(options.meta ?? {}),
      kind: "database",
      // Never attach SQL params / patient fields
    },
  });
}

export function logExternalServiceError(
  service: ExternalServiceName,
  error: unknown,
  options: LogErrorOptions = {},
): NormalizedError {
  return logError(error, {
    ...options,
    module: options.module ?? service,
    meta: {
      ...(options.meta ?? {}),
      externalService: service,
    },
  });
}

/**
 * Safe client-facing error body — never includes stack or credentials.
 */
export function toClientErrorBody(
  error: unknown,
  fallbackMessage = "Something went wrong.",
): {
  success: false;
  error: { code: string; message: string; requestId?: string };
} {
  const normalized = normalizeError(error);
  const requestId = getRequestId();

  const safeCodes = new Set([
    "UNAUTHORIZED",
    "FORBIDDEN",
    "VALIDATION_ERROR",
    "NOT_FOUND",
    "CONFLICT",
    "RATE_LIMITED",
  ]);

  const exposeMessage =
    (normalized.statusCode !== undefined &&
      normalized.statusCode >= 400 &&
      normalized.statusCode < 500) ||
    safeCodes.has(normalized.code);

  return {
    success: false,
    error: {
      code: normalized.code,
      message: exposeMessage ? normalized.message : fallbackMessage,
      ...(requestId ? { requestId } : {}),
    },
  };
}
