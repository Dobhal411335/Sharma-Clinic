import { cache } from "react";

import { FALLBACK_FOOTER } from "@/features/footer/footer.defaults";
import type { FooterConfig, StorefrontFooter } from "@/types/footer";

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

export function mapFooterConfigToStorefront(
  config: FooterConfig,
): StorefrontFooter {
  const columns = [...(config.columns || [])]
    .filter((column) => column.active)
    .sort((left, right) => (left.order || 0) - (right.order || 0))
    .map((column) => ({
      title: column.title,
      links: [...(column.links || [])]
        .filter((link) => link.active)
        .sort((left, right) => (left.order || 0) - (right.order || 0))
        .map((link) => ({
          label: link.label,
          href: link.url || "#",
        })),
    }))
    .filter((column) => column.links.length > 0);

  return {
    thankYou: config.thankYou?.trim() || FALLBACK_FOOTER.thankYou,
    description: config.description?.trim() || FALLBACK_FOOTER.description,
    columns: columns.length > 0 ? columns : FALLBACK_FOOTER.columns,
  };
}

/**
 * Server-side fetch of footer config for the .in storefront.
 * Cached per request via React `cache`. Falls back to static landing data.
 */
export const getFooterConfig = cache(async (): Promise<StorefrontFooter> => {
  try {
    const { readSingleton, withSite } = await import("@/features/cms/store");
    const row = await readSingleton("footer");
    if (!row) return FALLBACK_FOOTER;
    const data = withSite(row.payload, {
      id: "footer",
      updatedAt: row.updatedAt,
    }) as unknown as FooterConfig;
    if (!data.id) return FALLBACK_FOOTER;
    return mapFooterConfigToStorefront(data);
  } catch {
    return FALLBACK_FOOTER;
  }
});
