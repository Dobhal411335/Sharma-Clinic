/**
 * Pragmatic in-memory rate limiter for payment endpoints.
 *
 * LIMITATION: State is per Node.js process. On multi-instance / serverless
 * deployments this does not coordinate across instances — use Redis/Upstash
 * (or edge middleware) before production scale-out.
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult =
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; remaining: 0; resetAt: number; retryAfterSec: number };

export function checkRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): RateLimitResult {
  const now = input.now ?? Date.now();
  const existing = buckets.get(input.key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + input.windowMs;
    buckets.set(input.key, { count: 1, resetAt });
    return { allowed: true, remaining: input.limit - 1, resetAt };
  }

  if (existing.count >= input.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  buckets.set(input.key, existing);
  return {
    allowed: true,
    remaining: input.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

export function resetRateLimitStoreForTests(): void {
  buckets.clear();
}

export const PAYMENT_RATE_LIMITS = {
  createOrder: { limit: 20, windowMs: 60_000 },
  verify: { limit: 30, windowMs: 60_000 },
  status: { limit: 60, windowMs: 60_000 },
  refund: { limit: 10, windowMs: 60_000 },
} as const;
