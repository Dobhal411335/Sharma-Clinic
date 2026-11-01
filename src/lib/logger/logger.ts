import pino, { type Logger as PinoLogger } from "pino";

import { getLoggerConfig, type LoggerRuntimeConfig } from "./config";
import { getRequestStore } from "./context";
import { omitEmptyFields, PINO_REDACT_PATHS, sanitizeForLogging } from "./sanitizers";
import type { LogContext, LogLevel, SafeLogBindings } from "./types";

type LogMethod = (message: string, context?: SafeLogBindings) => void;

export interface AppLogger {
  trace: LogMethod;
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  fatal: LogMethod;
  child: (bindings: SafeLogBindings) => AppLogger;
  /** Underlying Pino instance — prefer AppLogger methods. */
  raw: PinoLogger;
  flush: () => void;
}

let cachedConfigKey: string | null = null;
let cachedPino: PinoLogger | null = null;
let cachedAppLogger: AppLogger | null = null;

function configCacheKey(config: LoggerRuntimeConfig): string {
  return [
    config.level,
    config.format,
    config.environment,
    config.slowRequestMs,
    config.slowDatabaseMs,
    config.slowExternalApiMs,
  ].join("|");
}

function buildPino(config: LoggerRuntimeConfig): PinoLogger {
  const baseOptions: pino.LoggerOptions = {
    level: config.level,
    base: {
      service: config.service,
      environment: config.environment,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [...PINO_REDACT_PATHS],
      censor: "[REDACTED]",
    },
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  };

  if (config.format === "pretty") {
    return pino({
      ...baseOptions,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
          singleLine: false,
        },
      },
    });
  }

  return pino(baseOptions);
}

function mergeContext(context?: SafeLogBindings): Record<string, unknown> {
  const store = getRequestStore();
  const fromStore: LogContext = {
    requestId: store?.requestId,
    traceId: store?.traceId,
    method: store?.method,
    route: store?.route,
    api: store?.api,
    userId: store?.userId,
    userRole: store?.userRole,
  };

  const merged = {
    ...omitEmptyFields(fromStore as Record<string, unknown>),
    ...(context
      ? (sanitizeForLogging(omitEmptyFields(context as Record<string, unknown>)) as Record<
          string,
          unknown
        >)
      : {}),
  };

  return merged;
}

function createAppLogger(pinoLogger: PinoLogger): AppLogger {
  const write =
    (level: LogLevel): LogMethod =>
    (message, context) => {
      try {
        const bindings = mergeContext(context);
        pinoLogger[level](bindings, message);
      } catch {
        // Logging must never crash the application.
        try {
          process.stderr.write(
            JSON.stringify({
              level: "error",
              message: "Logger failed to emit record",
              originalMessage: message,
            }) + "\n",
          );
        } catch {
          // Absolute last resort — swallow.
        }
      }
    };

  return {
    trace: write("trace"),
    debug: write("debug"),
    info: write("info"),
    warn: write("warn"),
    error: write("error"),
    fatal: write("fatal"),
    child(bindings) {
      const sanitized = sanitizeForLogging(
        omitEmptyFields(bindings as Record<string, unknown>),
      ) as SafeLogBindings;
      return createAppLogger(pinoLogger.child(sanitized));
    },
    raw: pinoLogger,
    flush() {
      try {
        pinoLogger.flush();
      } catch {
        // ignore
      }
    },
  };
}

/**
 * Returns the singleton application logger.
 * Rebuilds when LOG_* config identity changes (useful in tests).
 */
export function getLogger(): AppLogger {
  const config = getLoggerConfig();
  const key = configCacheKey(config);

  if (!cachedAppLogger || cachedConfigKey !== key || !cachedPino) {
    cachedPino = buildPino(config);
    cachedAppLogger = createAppLogger(cachedPino);
    cachedConfigKey = key;
  }

  return cachedAppLogger;
}

/** Test / hot-reload helper. */
export function resetLoggerForTests(): void {
  cachedPino = null;
  cachedAppLogger = null;
  cachedConfigKey = null;
}

/**
 * Build a logger from an explicit config (tests).
 */
export function createLoggerFromConfig(config: LoggerRuntimeConfig): AppLogger {
  return createAppLogger(buildPino(config));
}

export const logger: AppLogger = new Proxy({} as AppLogger, {
  get(_target, prop, receiver) {
    const instance = getLogger();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
