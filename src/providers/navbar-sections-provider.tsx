"use client";

import { createContext, useContext, type ReactNode } from "react";

import { FALLBACK_NAV_LINKS } from "@/features/navbar-sections/navbar-sections.defaults";
import type { StorefrontNavLink } from "@/types/navbar-sections";

const NavbarSectionsContext =
  createContext<StorefrontNavLink[]>(FALLBACK_NAV_LINKS);

export function NavbarSectionsProvider({
  value,
  children,
}: {
  value: StorefrontNavLink[] | null | undefined;
  children: ReactNode;
}) {
  return (
    <NavbarSectionsContext.Provider
      value={value && value.length > 0 ? value : FALLBACK_NAV_LINKS}
    >
      {children}
    </NavbarSectionsContext.Provider>
  );
}

export function useNavbarSections(): StorefrontNavLink[] {
  return useContext(NavbarSectionsContext);
}
