import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createLoggerConfig,
  formatLogLine,
  shouldLog,
  slowThresholdForKind,
} from "./logger.config";
import {
  createFrontendLogger,
  logPerformance,
  redactValue,
  REDACTED,
  sanitizeUrl,
} from "./index";

describe("frontend logger", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("suppresses debug when LOG_LEVEL=warn in production", () => {
    const config = createLoggerConfig("test", "production", {
      LOG_LEVEL: "warn",
    } as NodeJS.ProcessEnv);
    expect(shouldLog(config, "debug")).toBe(false);
    expect(shouldLog(config, "warn")).toBe(true);

    process.env = {
      ...originalEnv,
      LOG_LEVEL: "warn",
      NODE_ENV: "production",
    };
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const log = createFrontendLogger("test", "production");
    log.debug("hidden");
    log.warn("visible");
    expect(debugSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("defaults to info in production when LOG_LEVEL unset", () => {
    const config = createLoggerConfig("test", "production", {} as NodeJS.ProcessEnv);
    expect(config.minLevel).toBe("info");
    expect(config.format).toBe("json");
    expect(shouldLog(config, "debug")).toBe(false);
    expect(shouldLog(config, "info")).toBe(true);
  });

  it("allows debug in development", () => {
    process.env = {
      ...originalEnv,
      LOG_LEVEL: "debug",
      NODE_ENV: "development",
    };
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    const log = createFrontendLogger("test", "development");
    log.debug("visible");
    expect(debugSpy).toHaveBeenCalled();
  });

  it("formats json when LOG_FORMAT=json", () => {
    const line = formatLogLine("info", "test", "hello", { a: 1 }, "json");
    const parsed = JSON.parse(line) as {
      level: string;
      service: string;
      message: string;
      context: { a: number };
    };
    expect(parsed.level).toBe("info");
    expect(parsed.service).toBe("test");
    expect(parsed.message).toBe("hello");
    expect(parsed.context.a).toBe(1);
  });

  it("reads slow thresholds from env", () => {
    const config = createLoggerConfig("test", "development", {
      LOG_SLOW_REQUEST_MS: "1500",
      LOG_SLOW_DATABASE_MS: "250",
      LOG_SLOW_EXTERNAL_API_MS: "3000",
    } as NodeJS.ProcessEnv);
    expect(config.slow.requestMs).toBe(1500);
    expect(config.slow.databaseMs).toBe(250);
    expect(config.slow.externalApiMs).toBe(3000);
    expect(slowThresholdForKind("request", config.slow)).toBe(1500);
    expect(slowThresholdForKind("external", config.slow)).toBe(3000);
  });

  it("warns only when performance exceeds slow threshold", () => {
    process.env = {
      ...originalEnv,
      LOG_LEVEL: "debug",
      LOG_SLOW_EXTERNAL_API_MS: "100",
      NODE_ENV: "development",
    };
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);

    logPerformance({
      kind: "external",
      operation: "razorpay.createOrder",
      durationMs: 50,
    });
    expect(warnSpy).not.toHaveBeenCalled();
    expect(debugSpy).toHaveBeenCalled();

    logPerformance({
      kind: "external",
      operation: "razorpay.createOrder",
      durationMs: 150,
    });
    expect(warnSpy).toHaveBeenCalled();
  });

  it("redacts secrets from context", () => {
    const redacted = redactValue({
      password: "secret",
      otp: "123456",
      accessToken: "tok",
      route: "/login",
    }) as Record<string, unknown>;
    expect(redacted.password).toBe(REDACTED);
    expect(redacted.otp).toBe(REDACTED);
    expect(redacted.accessToken).toBe(REDACTED);
    expect(redacted.route).toBe("/login");
  });

  it("sanitizes sensitive query params", () => {
    const path = sanitizeUrl("/auth/reset?token=abc&x=1");
    expect(path).not.toContain("abc");
    expect(decodeURIComponent(path)).toContain(REDACTED);
  });

  it("does not throw when console fails", () => {
    process.env = {
      ...originalEnv,
      LOG_LEVEL: "debug",
      NODE_ENV: "development",
    };
    vi.spyOn(console, "error").mockImplementation(() => {
      throw new Error("console down");
    });
    const log = createFrontendLogger("test", "development");
    expect(() => log.error("boom", { password: "x" })).not.toThrow();
  });
});
