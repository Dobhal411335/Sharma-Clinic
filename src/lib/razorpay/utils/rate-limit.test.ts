import { beforeEach, describe, expect, it } from "vitest";

import { checkRateLimit, resetRateLimitStoreForTests } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStoreForTests();
  });

  it("allows requests under the limit", () => {
    const first = checkRateLimit({ key: "k", limit: 2, windowMs: 1000, now: 1 });
    const second = checkRateLimit({ key: "k", limit: 2, windowMs: 1000, now: 2 });
    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
  });

  it("blocks when limit exceeded", () => {
    checkRateLimit({ key: "k", limit: 1, windowMs: 1000, now: 1 });
    const blocked = checkRateLimit({ key: "k", limit: 1, windowMs: 1000, now: 2 });
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
  });
});
