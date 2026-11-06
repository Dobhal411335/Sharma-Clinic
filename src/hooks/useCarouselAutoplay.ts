"use client";

import { useEffect } from "react";

import type { CarouselApi } from "@/components/ui/carousel";

type UseCarouselAutoplayOptions = {
  enabled?: boolean;
  intervalMs?: number;
  paused?: boolean;
};

/** Advances an Embla carousel on an interval; clears on unmount or pause. */
export function useCarouselAutoplay(
  api: CarouselApi | undefined,
  {
    enabled = true,
    intervalMs = 5000,
    paused = false,
  }: UseCarouselAutoplayOptions = {},
) {
  useEffect(() => {
    if (!api || !enabled || paused) return;

    const timer = window.setInterval(() => {
      api.scrollNext();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [api, enabled, intervalMs, paused]);
}
