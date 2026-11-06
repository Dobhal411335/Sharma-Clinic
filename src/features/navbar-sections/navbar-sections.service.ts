import { cache } from "react";

import { FALLBACK_NAV_LINKS } from "@/features/navbar-sections/navbar-sections.defaults";
import type { NavbarSection, StorefrontNavLink } from "@/types/navbar-sections";

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

const STOREFRONT_SITE_CODE = "IN" as const;

function apiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) {
    return "";
  }
  return value.replace(/\/$/, "");
}

export function mapNavbarSectionsToNavLinks(sections: NavbarSection[]): StorefrontNavLink[] {
  return [...sections]
    .filter((section) => section.active)
    .sort((left, right) => (left.order || 0) - (right.order || 0))
    .map((section) => ({
      id: section.id,
      label: section.title,
      href: section.url || "#",
      description: section.description || "",
      menuHeading: section.menuHeading || section.title,
      menuDescription: section.menuDescription || "",
      children: [...(section.subSections || [])]
        .filter((sub) => sub.active)
        .sort((left, right) => (left.order || 0) - (right.order || 0))
        .map((sub) => ({
          id: sub.id,
          label: sub.title,
          href: sub.url || "#",
          description: sub.description || "",
        })),
    }));
}

/**
 * Server-side fetch of active navbar sections for the .in storefront.
 * Cached per request via React `cache`. Falls back to static landing links.
 */
export const getNavbarSections = cache(async (): Promise<StorefrontNavLink[]> => {
  try {
    const { listItems } = await import("@/features/cms/store");
    const items = await listItems("navbar");
    if (items.length === 0) return FALLBACK_NAV_LINKS;
    const links = mapNavbarSectionsToNavLinks(items as unknown as NavbarSection[]);
    return links.length > 0 ? links : FALLBACK_NAV_LINKS;
  } catch {
    return FALLBACK_NAV_LINKS;
  }
});
