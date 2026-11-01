import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

import type { RequestStore } from "./types";

const requestStorage = new AsyncLocalStorage<RequestStore>();

/** Trusted infra may forward this; never treat as authentication. */
export const REQUEST_ID_HEADER = "x-request-id";

/**
 * Accept UUID / cuid / nanoid-like opaque IDs from infrastructure.
 * Reject anything that looks like an injection payload.
 */
const REQUEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$/;

export function isValidRequestId(value: string): boolean {
  return REQUEST_ID_PATTERN.test(value);
}

export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Prefer a validated inbound x-request-id; otherwise generate a new UUID.
 */
export function resolveRequestId(incoming: string | null | undefined): string {
  const trimmed = incoming?.trim();
  if (trimmed && isValidRequestId(trimmed)) {
    return trimmed;
  }
  return generateRequestId();
}

export function getRequestStore(): RequestStore | undefined {
  return requestStorage.getStore();
}

export function getRequestId(): string | undefined {
  return requestStorage.getStore()?.requestId;
}

export function runWithRequestContext<T>(
  store: RequestStore,
  fn: () => T,
): T {
  return requestStorage.run(store, fn);
}

export async function runWithRequestContextAsync<T>(
  store: RequestStore,
  fn: () => Promise<T>,
): Promise<T> {
  return requestStorage.run(store, fn);
}

export function updateRequestStore(
  patch: Partial<Omit<RequestStore, "requestId" | "startedAt">>,
): void {
  const current = requestStorage.getStore();
  if (!current) {
    return;
  }
  Object.assign(current, patch);
}

export function createRequestStore(options: {
  requestId: string;
  method?: string;
  route?: string;
  api?: string;
  userId?: string;
  userRole?: string;
  traceId?: string;
}): RequestStore {
  return {
    requestId: options.requestId,
    method: options.method,
    route: options.route,
    api: options.api,
    userId: options.userId,
    userRole: options.userRole,
    traceId: options.traceId,
    startedAt: Date.now(),
  };
}
