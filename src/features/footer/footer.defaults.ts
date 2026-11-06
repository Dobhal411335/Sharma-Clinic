import { footer } from "@/data/landing";
import type { StorefrontFooter } from "@/types/footer";

export const FALLBACK_FOOTER: StorefrontFooter = {
  thankYou: footer.thankYou,
  description: footer.description,
  columns: footer.columns.map((column) => ({
    title: column.title,
    links: column.links.map((link) => ({
      label: link.label,
      href: link.href,
    })),
  })),
};
