"use client";

import { createContext, useContext, type ReactNode } from "react";

import { FALLBACK_FOOTER } from "@/features/footer/footer.defaults";
import type { StorefrontFooter } from "@/types/footer";

const FooterContext = createContext<StorefrontFooter>(FALLBACK_FOOTER);

export function FooterProvider({
  value,
  children,
}: {
  value: StorefrontFooter | null | undefined;
  children: ReactNode;
}) {
  return (
    <FooterContext.Provider value={value ?? FALLBACK_FOOTER}>
      {children}
    </FooterContext.Provider>
  );
}

export function useFooter(): StorefrontFooter {
  return useContext(FooterContext);
}
