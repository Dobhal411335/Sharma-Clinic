"use client";

import { createContext, useContext, type ReactNode } from "react";

import { FALLBACK_TOP_ADVERTISEMENT } from "@/features/top-advertisement/top-advertisement.defaults";
import type { StorefrontTopAdvertisement } from "@/types/top-advertisement";

const TopAdvertisementContext = createContext<StorefrontTopAdvertisement>(
  FALLBACK_TOP_ADVERTISEMENT,
);

export function TopAdvertisementProvider({
  value,
  children,
}: {
  value: StorefrontTopAdvertisement | null | undefined;
  children: ReactNode;
}) {
  return (
    <TopAdvertisementContext.Provider
      value={value ?? FALLBACK_TOP_ADVERTISEMENT}
    >
      {children}
    </TopAdvertisementContext.Provider>
  );
}

export function useTopAdvertisement(): StorefrontTopAdvertisement {
  return useContext(TopAdvertisementContext);
}
