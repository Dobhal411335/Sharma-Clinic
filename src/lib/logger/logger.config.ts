export type FrontendLogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<FrontendLogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export interface FrontendLoggerConfig {
  service: string;
  minLevel: FrontendLogLevel;
  isProduction: boolean;
}

export function createLoggerConfig(
  service: string,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): FrontendLoggerConfig {
  const isProduction = nodeEnv === "production";
  return {
    service,
    // Production: suppress verbose debug by default.
    minLevel: isProduction ? "warn" : "debug",
    isProduction,
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
  context?: Record<string, unknown>,
): string {
  const ts = new Date().toISOString();
  const ctx = context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : "";
  return `${ts} ${level.toUpperCase().padEnd(5)} [${service}] ${message}${ctx}`;
}
