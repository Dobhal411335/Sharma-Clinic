import type { GooeyToasterProps } from "goey-toast";

import type { ToastKind } from "./toast.types";

/** Global toaster props — mount once at the app root. */
export const TOAST_HOST_PROPS = {
  position: "top-center",
  duration: 4_000,
  theme: "light",
  closeButton: true,
  closeOnEscape: true,
  swipeToDismiss: true,
  showTimestamp: false,
  showProgress: false,
  preset: "subtle",
  visibleToasts: 3,
  maxQueue: 5,
  queueOverflow: "drop-oldest",
  gap: 12,
  offset: 16,
} as const satisfies GooeyToasterProps;

/** Per-kind default durations (ms). Errors linger slightly longer. */
export const TOAST_DURATION_MS: Record<ToastKind, number> = {
  success: 3_500,
  info: 4_000,
  warning: 5_000,
  error: 5_500,
};

export const DEFAULT_TOAST_FALLBACK =
  "Something went wrong. Please try again.";
