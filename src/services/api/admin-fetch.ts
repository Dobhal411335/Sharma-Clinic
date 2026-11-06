import { ApiError } from "@/services/api/errors";

type Envelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: { message?: string };
};

export async function adminData<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (typeof init?.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(path, { ...init, headers });
  } catch {
    throw new ApiError("Network error. Please check your connection and try again.");
  }

  let payload: Envelope<T> | null = null;
  try {
    payload = (await response.json()) as Envelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message || payload?.error?.message || "Request failed");
  }

  return payload?.data as T;
}

export function jsonBody(method: string, body?: unknown): RequestInit {
  return {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

export async function uploadMedia(
  file: File,
  type: "single-image" | "single-video",
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.set("type", type);
  formData.set("file", file);
  const data = await adminData<{ url?: string; secureUrl?: string; publicId?: string }>("/api/upload", {
    method: "POST",
    body: formData,
  });
  const url = data.secureUrl || data.url || "";
  const publicId = data.publicId || "";
  if (!url) throw new ApiError("Upload did not return a file URL.");
  return { url, publicId };
}
