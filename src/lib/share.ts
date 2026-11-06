"use client";

import { showError, showSuccess } from "@/lib/toast";
import type { ShareContentInput } from "@/lib/share-text";

export type { ShareContentInput } from "@/lib/share-text";
export { plainTextForShare } from "@/lib/share-text";

function resolveShareUrl(url?: string): string {
  if (typeof window === "undefined") {
    return url ?? "";
  }
  if (!url) {
    return window.location.href;
  }
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return window.location.href;
  }
}

/**
 * Share via the Web Share API when available; otherwise copy the URL.
 * Silently ignores user cancellation (`AbortError`).
 * Client-only — do not import this module from Server Components.
 */
export async function shareContent(input: ShareContentInput): Promise<void> {
  const url = resolveShareUrl(input.url);
  const toastId = input.toastId ?? "share";
  const text = input.text?.trim() || undefined;

  try {
    if (typeof navigator.share === "function") {
      await navigator.share({
        title: input.title,
        text,
        url,
      });
      return;
    }

    await navigator.clipboard.writeText(url);
    showSuccess("Link copied.", { id: `${toastId}.copied` });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }
    showError(input.errorMessage ?? "Could not share this link.", {
      id: `${toastId}.error`,
    });
  }
}
