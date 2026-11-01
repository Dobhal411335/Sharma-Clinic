import type { LogFormat, LogLevel } from "./types";
import { LOG_LEVELS } from "./types";

const SERVICE_NAME = "sharma-clinic";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value?.trim()) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseLogLevel(value: string | undefined, fallback: LogLevel): LogLevel {
  const normalized = value?.trim().toLowerCase();
  if (normalized && (LOG_LEVELS as readonly string[]).includes(normalized)) {
    return normalized as LogLevel;
  }
  return fallback;
}

function parseLogFormat(
  value: string | undefined,
  isProduction: boolean,
): LogFormat {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "json" || normalized === "pretty") {
    return normalized;
  }
  return isProduction ? "json" : "pretty";
}

export interface LoggerRuntimeConfig {
  service: string;
  environment: string;
  level: LogLevel;
  format: LogFormat;
  isProduction: boolean;
  slowRequestMs: number;
  slowDatabaseMs: number;
  slowExternalApiMs: number;
}

/**
 * Reads LOG_* environment variables.
 * Dev defaults: pretty + debug allowed. Prod: JSON + info.
 */
export function getLoggerConfig(
  env: NodeJS.ProcessEnv = process.env,
): LoggerRuntimeConfig {
  const isProduction = env.NODE_ENV === "production";
  const defaultLevel: LogLevel = isProduction ? "info" : "debug";

  return {
    service: SERVICE_NAME,
    environment: env.NODE_ENV ?? "development",
    level: parseLogLevel(env.LOG_LEVEL, defaultLevel),
    format: parseLogFormat(env.LOG_FORMAT, isProduction),
    isProduction,
    slowRequestMs: parsePositiveInt(env.LOG_SLOW_REQUEST_MS, 1000),
    slowDatabaseMs: parsePositiveInt(env.LOG_SLOW_DATABASE_MS, 500),
    slowExternalApiMs: parsePositiveInt(env.LOG_SLOW_EXTERNAL_API_MS, 2000),
  };
}

export { SERVICE_NAME };
