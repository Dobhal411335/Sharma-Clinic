export type FrontendLogLevel = "debug" | "info" | "warn" | "error";
export type LogFormat = "json" | "pretty";

const LEVEL_ORDER: Record<FrontendLogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export interface SlowLogThresholds {
  requestMs: number;
  databaseMs: number;
  externalApiMs: number;
}

export interface FrontendLoggerConfig {
  service: string;
  minLevel: FrontendLogLevel;
  isProduction: boolean;
  format: LogFormat;
  slow: SlowLogThresholds;
}

function parseLogLevel(
  raw: string | undefined,
  isProduction: boolean,
): FrontendLogLevel {
  const value = raw?.trim().toLowerCase();
  if (value === "debug" || value === "info" || value === "warn" || value === "error") {
    return value;
  }
  // Defaults when LOG_LEVEL unset: debug in dev, info in production.
  return isProduction ? "info" : "debug";
}

function parseLogFormat(raw: string | undefined, isProduction: boolean): LogFormat {
  const value = raw?.trim().toLowerCase();
  if (value === "json" || value === "pretty") {
    return value;
  }
  return isProduction ? "json" : "pretty";
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw?.trim()) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

export function readSlowLogThresholds(
  env: NodeJS.ProcessEnv = process.env,
): SlowLogThresholds {
  return {
    requestMs: parsePositiveInt(env.LOG_SLOW_REQUEST_MS, 1000),
    databaseMs: parsePositiveInt(env.LOG_SLOW_DATABASE_MS, 500),
    externalApiMs: parsePositiveInt(env.LOG_SLOW_EXTERNAL_API_MS, 2000),
  };
}

export function createLoggerConfig(
  service: string,
  nodeEnv: string | undefined = process.env.NODE_ENV,
  env: NodeJS.ProcessEnv = process.env,
): FrontendLoggerConfig {
  const isProduction = nodeEnv === "production";
  return {
    service,
    minLevel: parseLogLevel(env.LOG_LEVEL, isProduction),
    isProduction,
    format: parseLogFormat(env.LOG_FORMAT, isProduction),
    slow: readSlowLogThresholds(env),
  };
}

export function shouldLog(
  config: FrontendLoggerConfig,
  level: FrontendLogLevel,
): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[config.minLevel];
}

export function formatLogLine(
  level: FrontendLogLevel,
  service: string,
  message: string,
  context: Record<string, unknown> | undefined,
  format: LogFormat = "pretty",
): string {
  const ts = new Date().toISOString();
  if (format === "json") {
    return JSON.stringify({
      ts,
      level,
      service,
      message,
      ...(context && Object.keys(context).length > 0 ? { context } : {}),
    });
  }

  const ctx =
    context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : "";
  return `${ts} ${level.toUpperCase().padEnd(5)} [${service}] ${message}${ctx}`;
}

export function slowThresholdForKind(
  kind: string | undefined,
  slow: SlowLogThresholds,
): number | undefined {
  if (kind === "request") return slow.requestMs;
  if (kind === "database") return slow.databaseMs;
  if (kind === "external") return slow.externalApiMs;
  return undefined;
}
