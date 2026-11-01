/**
 * Shared logging / audit types for Sharma Clinic.
 * Server-side only — never import from Client Components.
 */

export const LOG_LEVELS = [
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export type LogFormat = "json" | "pretty";

/**
 * Structured fields attached to log records.
 * Optional fields are omitted when empty to keep stdout compact.
 */
export interface LogContext {
  timestamp?: string;
  level?: LogLevel;
  service?: string;
  environment?: string;
  requestId?: string;
  traceId?: string;
  method?: string;
  api?: string;
  route?: string;
  module?: string;
  function?: string;
  file?: string;
  userId?: string;
  userRole?: string;
  appointmentId?: string;
  paymentId?: string;
  doctorId?: string;
  durationMs?: number;
  errorCode?: string;
  message?: string;
  [key: string]: unknown;
}

export type SafeLogBindings = Omit<LogContext, "timestamp" | "level" | "message">;

export interface NormalizedError {
  name: string;
  message: string;
  code: string;
  stack?: string;
  statusCode?: number;
}

export interface LogErrorOptions {
  module?: string;
  function?: string;
  file?: string;
  endpoint?: string;
  appointmentId?: string;
  paymentId?: string;
  doctorId?: string;
  userId?: string;
  durationMs?: number;
  /** Extra safe metadata — will be sanitized. */
  meta?: Record<string, unknown>;
  /** When false, do not rethrow after logging. Default true for wrappers that catch. */
  rethrow?: boolean;
}

export interface LogRequestOptions {
  method: string;
  route: string;
  api?: string;
  userId?: string;
  userRole?: string;
  meta?: Record<string, unknown>;
}

export interface LogResponseOptions {
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  api?: string;
  meta?: Record<string, unknown>;
}

export interface LogPerformanceOptions {
  operation: string;
  durationMs: number;
  kind?: "request" | "database" | "external" | "other";
  module?: string;
  function?: string;
  meta?: Record<string, unknown>;
}

export interface AuditEventInput {
  action: string;
  entityType: string;
  entityId: string;
  actorUserId?: string | null;
  /** Safe metadata only — sanitized before persist. Never passwords/tokens/PII. */
  metadata?: Record<string, unknown> | null;
  /** Mirror a safe INFO marker into app logs. Default true. */
  mirrorToAppLogs?: boolean;
}

export interface AuditLogRecord {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
  createdAt: Date;
}

export type ExternalServiceName =
  | "razorpay"
  | "cloudinary"
  | "brevo"
  | "database"
  | "auth"
  | string;

export interface RequestStore {
  requestId: string;
  traceId?: string;
  method?: string;
  route?: string;
  api?: string;
  userId?: string;
  userRole?: string;
  startedAt: number;
}
