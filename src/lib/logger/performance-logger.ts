import { getLoggerConfig } from "./config";
import { logger } from "./logger";
import { sanitizeForLogging } from "./sanitizers";
import type { LogPerformanceOptions } from "./types";

function thresholdFor(
  kind: LogPerformanceOptions["kind"],
): number | undefined {
  const config = getLoggerConfig();
  switch (kind) {
    case "request":
      return config.slowRequestMs;
    case "database":
      return config.slowDatabaseMs;
    case "external":
      return config.slowExternalApiMs;
    default:
      return undefined;
  }
}

/**
 * Record an operation duration. Emits WARN when configured thresholds are exceeded.
 * Non-blocking and never throws.
 */
export function logPerformance(options: LogPerformanceOptions): void {
  try {
    const kind = options.kind ?? "other";
    const threshold = thresholdFor(kind);
    const exceeded =
      threshold !== undefined && options.durationMs >= threshold;

    const bindings = {
      module: options.module,
      function: options.function,
      durationMs: options.durationMs,
      operation: options.operation,
      performanceKind: kind,
      slow: exceeded,
      thresholdMs: threshold,
      ...(options.meta
        ? { meta: sanitizeForLogging(options.meta) as Record<string, unknown> }
        : {}),
    };

    if (exceeded) {
      logger.warn(`Slow ${kind}: ${options.operation}`, bindings);
      return;
    }

    logger.debug(`Performance: ${options.operation}`, bindings);
  } catch {
    // never crash
  }
}

/**
 * Measure an async operation and log its duration.
 */
export async function withPerformanceLogging<T>(
  options: Omit<LogPerformanceOptions, "durationMs">,
  fn: () => Promise<T>,
): Promise<T> {
  const started = Date.now();
  try {
    return await fn();
  } finally {
    logPerformance({
      ...options,
      durationMs: Date.now() - started,
    });
  }
}
