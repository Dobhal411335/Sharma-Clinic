/**
 * In-memory idempotency store for transactional emails.
 * Independent of Brevo; prepare for a future EmailLog table.
 * Note: resets on process restart and is not shared across instances.
 */

export interface IdempotencyEntry {
  messageId: string;
  createdAt: number;
}

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const store = new Map<string, IdempotencyEntry>();

function pruneExpired(now: number, ttlMs: number): void {
  for (const [key, entry] of store.entries()) {
    if (now - entry.createdAt > ttlMs) {
      store.delete(key);
    }
  }
}

export function getIdempotentResult(
  key: string,
  ttlMs = DEFAULT_TTL_MS,
): IdempotencyEntry | null {
  const now = Date.now();
  pruneExpired(now, ttlMs);
  const entry = store.get(key);
  if (!entry) {
    return null;
  }
  if (now - entry.createdAt > ttlMs) {
    store.delete(key);
    return null;
  }
  return entry;
}

export function rememberIdempotentResult(
  key: string,
  messageId: string,
  ttlMs = DEFAULT_TTL_MS,
): void {
  const now = Date.now();
  pruneExpired(now, ttlMs);
  store.set(key, { messageId, createdAt: now });
}

/** Test helper — clears the in-memory store. */
export function clearIdempotencyStore(): void {
  store.clear();
}
