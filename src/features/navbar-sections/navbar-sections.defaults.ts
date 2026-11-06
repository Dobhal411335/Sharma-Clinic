import { navLinks } from "@/data/landing";
import type { StorefrontNavLink } from "@/types/navbar-sections";

/** Static fallback used when the API is unavailable or returns no active sections. */
export const FALLBACK_NAV_LINKS: StorefrontNavLink[] = navLinks.map((link, index) => ({
  id: `fallback-${index}`,
  label: link.label,
  href: link.href,
  description: "",
  menuHeading: link.label,
  menuDescription: "",
  children: [],
}));
