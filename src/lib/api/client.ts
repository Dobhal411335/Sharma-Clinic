export class ApiRequestError extends Error {
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.details = details;
  }
}

export function toApiError(error: unknown): { message: string; details?: unknown } {
  if (error instanceof ApiRequestError) {
    return { message: error.message, details: error.details };
  }
  if (error instanceof Error && error.message.trim()) {
    return { message: error.message };
  }
  return { message: "Request failed" };
}

export function publicApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) return "";
  return value.replace(/\/$/, "");
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function errorMessage(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) return fallback;
  if (typeof payload.message === "string" && payload.message.trim()) return payload.message;
  if (typeof payload.error === "string" && payload.error.trim()) return payload.error;
  return fallback;
}

function errorDetails(payload: unknown): unknown {
  if (!isRecord(payload)) return undefined;
  if ("details" in payload) return payload.details;
  if ("fieldErrors" in payload) return { fieldErrors: payload.fieldErrors };
  return payload;
}

/** JSON or multipart request against NEXT_PUBLIC_API_URL. */
export async function publicApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = publicApiBaseUrl();
  if (!base) {
    throw new ApiRequestError("The API address is not configured.");
  }

  const isForm = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const headers = new Headers(init?.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (!isForm && init?.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, { ...init, headers });
  } catch {
    throw new ApiRequestError("Network error. Please check your connection and try again.");
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const failed = !response.ok || (isRecord(payload) && payload.success === false);
  if (failed) {
    throw new ApiRequestError(
      errorMessage(payload, "Request failed"),
      errorDetails(payload),
    );
  }

  return payload as T;
}
