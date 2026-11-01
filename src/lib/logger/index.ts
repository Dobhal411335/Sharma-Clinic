import "server-only";

/**
 * Sharma Clinic centralized logging + audit foundation.
 *
 * App logs → stdout/stderr (Pino). Audit events → PostgreSQL `audit_logs`.
 * Doctors must not read admin audits — no public audit read API here.
 */

export { getLoggerConfig, SERVICE_NAME } from "./config";
export type { LoggerRuntimeConfig } from "./config";

export {
  REQUEST_ID_HEADER,
  createRequestStore,
  generateRequestId,
  getRequestId,
  getRequestStore,
  isValidRequestId,
  resolveRequestId,
  runWithRequestContext,
  runWithRequestContextAsync,
  updateRequestStore,
} from "./context";

export {
  createLoggerFromConfig,
  getLogger,
  logger,
  resetLoggerForTests,
} from "./logger";
export type { AppLogger } from "./logger";

export {
  logError,
  logDatabaseError,
  logExternalServiceError,
  normalizeError,
  toClientErrorBody,
} from "./error-logger";

export {
  logRequest,
  logResponse,
  setRequestUser,
  withRequestLogging,
} from "./request-logger";
export type {
  ApiRouteContext,
  ApiRouteHandler,
  WithRequestLoggingOptions,
} from "./request-logger";

export { logPerformance, withPerformanceLogging } from "./performance-logger";

export {
  logAuditEvent,
  setAuditPrismaClientForTests,
} from "./audit-logger";
export type { AuditPrismaClient } from "./audit-logger";

export {
  MASKED_EMAIL,
  MASKED_PHONE,
  PINO_REDACT_PATHS,
  REDACTED,
  maskEmail,
  maskPhone,
  omitEmptyFields,
  sanitizeForLogging,
  sanitizeString,
} from "./sanitizers";

export type {
  AuditEventInput,
  AuditLogRecord,
  ExternalServiceName,
  LogContext,
  LogErrorOptions,
  LogFormat,
  LogLevel,
  LogPerformanceOptions,
  LogRequestOptions,
  LogResponseOptions,
  NormalizedError,
  RequestStore,
  SafeLogBindings,
} from "./types";
export { LOG_LEVELS } from "./types";

/**
 * Razorpay service instrumentation checklist (wired in `src/lib/razorpay`).
 * Keep logs id-only — never signatures, key secrets, card data, or patient PII.
 * See `INTEGRATION.md` for the full wiring table.
 */
export const RAZORPAY_LOG_INTEGRATION_POINTS = [
  "createOrder",
  "verifyPayment",
  "processWebhook",
  "refundPayment",
  "capturePayment",
  "reconcilePayment",
] as const;
