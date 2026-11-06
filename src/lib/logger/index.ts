import { AsyncLocalStorage } from "node:async_hooks";

import {
  createLoggerConfig,
  formatLogLine,
  shouldLog,
  type FrontendLogLevel,
} from "./logger.config";
import { redactValue } from "./logger.redaction";

export { sanitizeUrl, redactValue, REDACTED, isSensitiveKey } from "./logger.redaction";
export type { FrontendLogLevel } from "./logger.config";
export { createLoggerConfig, shouldLog } from "./logger.config";

export type LogContext = Record<string, unknown>;

type LogMethod = (message: string, context?: LogContext) => void;

export interface FrontendLogger {
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
}

function write(
  level: FrontendLogLevel,
  service: string,
  message: string,
  context?: LogContext,
  nodeEnv?: string,
): void {
  const config = createLoggerConfig(service, nodeEnv ?? process.env.NODE_ENV);
  if (!shouldLog(config, level)) {
    return;
  }

  try {
    const safe = context ? (redactValue(context) as LogContext) : undefined;
    const line = formatLogLine(level, service, message, safe);
    const consoleMethod =
      level === "debug"
        ? "debug"
        : level === "info"
          ? "info"
          : level === "warn"
            ? "warn"
            : "error";
    // eslint-disable-next-line no-console -- centralized frontend logger sink
    console[consoleMethod](line);
  } catch {
    // Logging must never break the UI.
  }
}

export function createFrontendLogger(
  service = "clinic-storefront",
  nodeEnv?: string,
): FrontendLogger {
  return {
    debug: (message, context) => write("debug", service, message, context, nodeEnv),
    info: (message, context) => write("info", service, message, context, nodeEnv),
    warn: (message, context) => write("warn", service, message, context, nodeEnv),
    error: (message, context) => write("error", service, message, context, nodeEnv),
  };
}

export const logger = createFrontendLogger("clinic-storefront");

export const REQUEST_ID_HEADER = "x-request-id";

type RequestStore = { requestId?: string; userId?: string; role?: string };

const requestStore = new AsyncLocalStorage<RequestStore>();

export function getRequestId(): string | undefined {
  return requestStore.getStore()?.requestId;
}

export function setRequestUser(userId: string, role: string): void {
  const current = requestStore.getStore();
  if (!current) return;
  current.userId = userId;
  current.role = role;
}

export function logError(error: unknown, context?: LogContext): void {
  logger.error(error instanceof Error ? error.message : "Request failed", {
    ...context,
    errorName: error instanceof Error ? error.name : "unknown",
  });
}

export type ApiRouteContext = {
  params?:
    | Record<string, string | string[]>
    | Promise<Record<string, string | string[]>>;
};

export function logAuditEvent(
  message: string | LogContext,
  context?: LogContext,
): void {
  if (typeof message === "string") {
    logger.info(message, context);
    return;
  }
  const action = typeof message.action === "string" ? message.action : "audit";
  logger.info(action, message);
}

export function withRequestLogging<Args extends unknown[]>(
  handler: (request: Request, ...args: Args) => Promise<Response>,
  _meta?: { api?: string },
): (request: Request, ...args: Args) => Promise<Response> {
  return async (request: Request, ...args: Args) => {
    const requestId = request.headers.get(REQUEST_ID_HEADER) ?? crypto.randomUUID();
    return requestStore.run({ requestId }, () => handler(request, ...args));
  };
}
