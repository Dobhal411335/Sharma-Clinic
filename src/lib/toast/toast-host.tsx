"use client";

import { GooeyToaster } from "goey-toast";
import "goey-toast/styles.css";

import { TOAST_HOST_PROPS } from "./toast.config";

/**
 * Mount once near the app root. Do not add additional toast containers
 * in nested layouts.
 */
export function ToastHost() {
  return <GooeyToaster {...TOAST_HOST_PROPS} />;
}
