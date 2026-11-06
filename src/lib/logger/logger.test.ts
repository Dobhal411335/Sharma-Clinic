import { createLoggerConfig, shouldLog } from "./logger.config";
import { createFrontendLogger, redactValue, REDACTED, sanitizeUrl } from "./index";

describe("frontend logger", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("suppresses debug in production", () => {
    const config = createLoggerConfig("test", "production");
    expect(shouldLog(config, "debug")).toBe(false);
    expect(shouldLog(config, "warn")).toBe(true);

    const debugSpy = jest.spyOn(console, "debug").mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const log = createFrontendLogger("test", "production");
    log.debug("hidden");
    log.warn("visible");
    expect(debugSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("allows debug in development", () => {
    const debugSpy = jest.spyOn(console, "debug").mockImplementation(() => undefined);
    const log = createFrontendLogger("test", "development");
    log.debug("visible");
    expect(debugSpy).toHaveBeenCalled();
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
    jest.spyOn(console, "error").mockImplementation(() => {
      throw new Error("console down");
    });
    const log = createFrontendLogger("test", "development");
    expect(() => log.error("boom", { password: "x" })).not.toThrow();
  });
});
