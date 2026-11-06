import type { ReactNode } from "react";

export type ToastKind = "success" | "error" | "warning" | "info";

export type ToastHelperOptions = {
  /** Optional body shown under the title. */
  description?: ReactNode;
  /** Stable id so the same event replaces an existing toast instead of stacking. */
  id?: string | number;
  /** Override the default duration for this toast kind (ms). */
  duration?: number;
};
