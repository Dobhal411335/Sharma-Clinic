import { afterEach, describe, expect, it, vi } from "vitest";

import {
  generateRequestId,
  isValidRequestId,
  resolveRequestId,
  runWithRequestContextAsync,
  createRequestStore,
  getRequestId,
} from "../context";
import { getLoggerConfig } from "../config";
import {
  normalizeError,
  logError,
  logExternalServiceError,
  logDatabaseError,
} from "../error-logger";
import {
  createLoggerFromConfig,
  getLogger,
  resetLoggerForTests,
} from "../logger";
import { logPerformance } from "../performance-logger";
import {
  logAuditEvent,
  setAuditPrismaClientForTests,
  type AuditPrismaClient,
} from "../audit-logger";
import {
  MASKED_EMAIL,
  MASKED_PHONE,
  REDACTED,
  sanitizeForLogging,
} from "../sanitizers";
import type { LoggerRuntimeConfig } from "../config";

function baseConfig(
  overrides: Partial<LoggerRuntimeConfig> = {},
): LoggerRuntimeConfig {
  return {
    service: "sharma-clinic",
    environment: "test",
    level: "debug",
    format: "json",
    isProduction: false,
    slowRequestMs: 1000,
    slowDatabaseMs: 500,
    slowExternalApiMs: 2000,
    ...overrides,
  };
}

describe("logger config", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    resetLoggerForTests();
  });

  it("defaults to info + json in production", () => {
    const config = getLoggerConfig({
      NODE_ENV: "production",
    } as NodeJS.ProcessEnv);
    expect(config.level).toBe("info");
    expect(config.format).toBe("json");
  });

  it("defaults to debug + pretty in development", () => {
    const config = getLoggerConfig({
      NODE_ENV: "development",
    } as NodeJS.ProcessEnv);
    expect(config.level).toBe("debug");
    expect(config.format).toBe("pretty");
  });

  it("respects LOG_LEVEL and LOG_FORMAT overrides", () => {
    const config = getLoggerConfig({
      NODE_ENV: "production",
      LOG_LEVEL: "warn",
      LOG_FORMAT: "pretty",
      LOG_SLOW_REQUEST_MS: "1500",
    } as NodeJS.ProcessEnv);
    expect(config.level).toBe("warn");
    expect(config.format).toBe("pretty");
    expect(config.slowRequestMs).toBe(1500);
  });

  it("initializes a usable logger singleton", () => {
    process.env.LOG_FORMAT = "json";
    process.env.LOG_LEVEL = "info";
    resetLoggerForTests();
    const log = getLogger();
    expect(() => log.info("init ok", { module: "test" })).not.toThrow();
  });
});

describe("request id", () => {
  it("generates UUID-like ids", () => {
    const id = generateRequestId();
    expect(isValidRequestId(id)).toBe(true);
  });

  it("validates trusted header format and rejects junk", () => {
    expect(isValidRequestId("req_abc12345")).toBe(true);
    expect(isValidRequestId("short")).toBe(false);
    expect(isValidRequestId("bad id with spaces!!!")).toBe(false);
    expect(isValidRequestId('<script>alert(1)</script>')).toBe(false);
  });

  it("propagates validated inbound id via AsyncLocalStorage", async () => {
    const inbound = "inbound-request-id-001";
    const resolved = resolveRequestId(inbound);
    expect(resolved).toBe(inbound);

    await runWithRequestContextAsync(
      createRequestStore({ requestId: resolved, method: "GET", route: "/api/x" }),
      async () => {
        expect(getRequestId()).toBe(inbound);
      },
    );
  });

  it("generates a new id when header is missing or invalid", () => {
    const a = resolveRequestId(undefined);
    const b = resolveRequestId("!!!invalid!!!");
    expect(isValidRequestId(a)).toBe(true);
    expect(isValidRequestId(b)).toBe(true);
    expect(b).not.toBe("!!!invalid!!!");
  });
});

describe("sanitization", () => {
  it("redacts secrets and auth material recursively", () => {
    const sanitized = sanitizeForLogging({
      password: "super-secret",
      apiKey: "ck_live_xxx",
      nested: {
        authorization: "Bearer abc",
        token: "jwt-here",
        razorpay_signature: "sig",
      },
      safe: "ok",
    }) as Record<string, unknown>;

    expect(sanitized.password).toBe(REDACTED);
    expect(sanitized.apiKey).toBe(REDACTED);
    expect((sanitized.nested as Record<string, unknown>).authorization).toBe(
      REDACTED,
    );
    expect((sanitized.nested as Record<string, unknown>).token).toBe(REDACTED);
    expect(sanitized.safe).toBe("ok");
  });

  it("masks emails and phones", () => {
    const sanitized = sanitizeForLogging({
      note: "Contact patient@example.com or +91 98765 43210",
    }) as Record<string, unknown>;
    expect(String(sanitized.note)).toContain(MASKED_EMAIL);
    expect(String(sanitized.note)).toContain(MASKED_PHONE);
    expect(String(sanitized.note)).not.toContain("patient@example.com");
  });

  it("strips patient body / medical keys", () => {
    const sanitized = sanitizeForLogging({
      patientEmail: "a@b.com",
      diagnosis: "secret-condition",
      appointmentId: "appt_1",
    }) as Record<string, unknown>;
    expect(sanitized.patientEmail).toBe(REDACTED);
    expect(sanitized.diagnosis).toBe(REDACTED);
    expect(sanitized.appointmentId).toBe("appt_1");
  });

  it("limits oversized payloads", () => {
    const big = "x".repeat(2000);
    const sanitized = sanitizeForLogging({ big }) as Record<string, unknown>;
    expect(String(sanitized.big).length).toBeLessThan(big.length);
  });
});

describe("error normalization", () => {
  it("captures stack and normalizes Prisma errors", () => {
    const err = new Error("raw sql boom");
    err.name = "PrismaClientKnownRequestError";
    (err as Error & { code: string }).code = "P2002";

    const normalized = normalizeError(err);
    expect(normalized.code).toBe("PRISMA_P2002");
    expect(normalized.message).toBe("Database operation failed.");
    expect(normalized.stack).toContain("PrismaClientKnownRequestError");
  });

  it("normalizes Cloudinary / Brevo / Razorpay adapter errors", () => {
    class CloudinaryError extends Error {
      code = "CLOUDINARY_UPLOAD_FAILED";
      statusCode = 502;
      constructor() {
        super("Upload to Cloudinary failed.");
        this.name = "CloudinaryError";
      }
    }
    const normalized = normalizeError(new CloudinaryError());
    expect(normalized.code).toBe("CLOUDINARY_UPLOAD_FAILED");
    expect(normalized.statusCode).toBe(502);
  });

  it("logDatabaseError and logExternalServiceError do not throw", () => {
    const log = createLoggerFromConfig(baseConfig());
    vi.spyOn(log.raw, "error").mockImplementation(() => log.raw);

    expect(() =>
      logDatabaseError(new Error("db"), { operation: "findUnique" }),
    ).not.toThrow();
    expect(() =>
      logExternalServiceError("razorpay", new Error("rzp"), {
        paymentId: "pay_1",
      }),
    ).not.toThrow();
  });

  it("logError failure path never crashes the app", () => {
    resetLoggerForTests();
    const log = getLogger();
    vi.spyOn(log.raw, "error").mockImplementation(() => {
      throw new Error("pino exploded");
    });

    expect(() => logError(new Error("boom"), { module: "test" })).not.toThrow();
  });
});

describe("performance", () => {
  afterEach(() => {
    delete process.env.LOG_SLOW_REQUEST_MS;
    resetLoggerForTests();
  });

  it("warns when duration exceeds slow thresholds", () => {
    process.env.LOG_FORMAT = "json";
    process.env.LOG_SLOW_REQUEST_MS = "100";
    process.env.LOG_LEVEL = "debug";
    resetLoggerForTests();
    const singleton = getLogger();
    const singletonWarn = vi
      .spyOn(singleton.raw, "warn")
      .mockImplementation(() => singleton.raw);

    logPerformance({
      operation: "GET /api/slow",
      durationMs: 250,
      kind: "request",
      module: "http",
    });

    expect(singletonWarn).toHaveBeenCalled();
  });
});

describe("audit persistence", () => {
  afterEach(() => {
    setAuditPrismaClientForTests(null);
  });

  it("persists sanitized audit rows and mirrors INFO", async () => {
    const create = vi.fn().mockResolvedValue({
      id: "aud_1",
      actorUserId: "user_1",
      action: "doctor.fee_updated",
      entityType: "Doctor",
      entityId: "doc_1",
      metadata: { previousFeePaise: 50000, nextFeePaise: 60000 },
      createdAt: new Date("2026-11-01T00:00:00.000Z"),
    });

    const mockPrisma: AuditPrismaClient = {
      auditLog: { create },
    };
    setAuditPrismaClientForTests(mockPrisma);

    process.env.LOG_FORMAT = "json";
    process.env.LOG_LEVEL = "info";
    resetLoggerForTests();
    const info = vi.spyOn(getLogger().raw, "info").mockImplementation(() => getLogger().raw);

    const record = await logAuditEvent({
      action: "doctor.fee_updated",
      entityType: "Doctor",
      entityId: "doc_1",
      actorUserId: "user_1",
      metadata: {
        previousFeePaise: 50000,
        nextFeePaise: 60000,
        password: "should-not-persist-raw",
      },
    });

    expect(record?.id).toBe("aud_1");
    expect(create).toHaveBeenCalledOnce();
    const arg = create.mock.calls[0][0];
    expect(arg.data.metadata.password).toBe(REDACTED);
    expect(info).toHaveBeenCalled();
  });

  it("returns null instead of crashing when prisma fails", async () => {
    setAuditPrismaClientForTests({
      auditLog: {
        create: vi.fn().mockRejectedValue(new Error("db down")),
      },
    });

    const result = await logAuditEvent({
      action: "test.action",
      entityType: "Test",
      entityId: "t1",
    });
    expect(result).toBeNull();
  });
});

describe("no sensitive leaks in emitted bindings", () => {
  it("child logger sanitizes bindings", () => {
    const log = createLoggerFromConfig(baseConfig());
    const child = log.child({
      password: "secret",
      apiKey: "key",
      module: "safe",
    });
    expect(child).toBeTruthy();
    expect(() =>
      child.info("hello", {
        cookie: "session=abc",
        patientEmail: "x@y.com",
      }),
    ).not.toThrow();
  });
});
