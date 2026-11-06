import { gooeyToast } from "goey-toast";

import { TOAST_DURATION_MS } from "./toast.config";
import { sanitizeUserMessage } from "./toast.messages";
import type { ToastHelperOptions, ToastKind } from "./toast.types";

export type { ToastHelperOptions, ToastKind } from "./toast.types";
export { TOAST_HOST_PROPS, TOAST_DURATION_MS } from "./toast.config";
export { sanitizeUserMessage } from "./toast.messages";
export { ToastHost } from "./toast-host";

function showToast(
  kind: ToastKind,
  message: string,
  options?: ToastHelperOptions,
): string | number {
  const title = sanitizeUserMessage(message);
  const duration = options?.duration ?? TOAST_DURATION_MS[kind];

  return gooeyToast[kind](title, {
    description: options?.description,
    id: options?.id,
    duration,
    showTimestamp: false,
    preset: "subtle",
  });
}

export function showSuccess(
  message: string,
  options?: ToastHelperOptions,
): string | number {
  return showToast("success", message, options);
}

export function showError(
  message: string,
  options?: ToastHelperOptions,
): string | number {
  return showToast("error", message, options);
}

export function showInfo(
  message: string,
  options?: ToastHelperOptions,
): string | number {
  return showToast("info", message, options);
}

export function showWarning(
  message: string,
  options?: ToastHelperOptions,
): string | number {
  return showToast("warning", message, options);
}

export function dismissToast(
  idOrFilter?: Parameters<typeof gooeyToast.dismiss>[0],
): void {
  gooeyToast.dismiss(idOrFilter);
}
