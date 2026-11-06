import { cache } from "react";

import { FALLBACK_PROMO_BANNERS } from "@/features/promo-banner/promo-banner.defaults";
import type { PromoBannerConfigDto, StorefrontPromoBanner } from "@/types/promo-banner";

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

function optionalHref(url: string | undefined): string {
  const trimmed = url?.trim();
  if (!trimmed || trimmed === "#") return "";
  return trimmed;
}

export function mapPromoBannerConfigToStorefront(
  config: PromoBannerConfigDto,
): StorefrontPromoBanner[] {
  return (config.items || [])
    .filter((item) => item.active)
    .map((item) => {
      const heading = item.heading?.trim() || "";
      const miniHeading = item.miniHeading?.trim() || "";
      return {
        id: item.id,
        miniHeading,
        heading,
        description: item.description?.trim() || "",
        buttonLabel: item.buttonLabel?.trim() || "",
        href: optionalHref(item.buttonUrl),
      };
    });
}

export const getPromoBanners = cache(async (): Promise<StorefrontPromoBanner[]> => {
  try {
    const { readSingleton, withSite } = await import("@/features/cms/store");
    const row = await readSingleton("promo-banner");
    if (!row) return FALLBACK_PROMO_BANNERS;
    const data = withSite(row.payload, {
      id: "promo-banner",
      updatedAt: row.updatedAt,
    }) as unknown as PromoBannerConfigDto;
    const mapped = mapPromoBannerConfigToStorefront(data);
    return mapped.length > 0 ? mapped : FALLBACK_PROMO_BANNERS;
  } catch {
    return FALLBACK_PROMO_BANNERS;
  }
});
