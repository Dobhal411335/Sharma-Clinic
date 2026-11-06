import { cache } from "react";

import { FALLBACK_TOP_ADVERTISEMENT } from "@/features/top-advertisement/top-advertisement.defaults";
import type {
  StorefrontTopAdvertisement,
  TopAdvertisementConfig,
} from "@/types/top-advertisement";

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

function optionalHref(url: string | undefined): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed || trimmed === "#") return undefined;
  return trimmed;
}

export function mapTopAdvertisementConfigToStorefront(
  config: TopAdvertisementConfig,
): StorefrontTopAdvertisement {
  const announcements = (config.announcements || [])
    .filter((item) => item.active && item.text.trim())
    .map((item) => ({
      text: item.text.trim(),
      href: optionalHref(item.url),
    }));

  const utilityItems = (config.utilityItems || [])
    .filter((item) => item.active && item.text.trim())
    .map((item) => ({
      text: item.text.trim(),
      href: optionalHref(item.url),
    }));

  const benefits = (config.benefits || [])
    .filter((item) => item.active && item.text.trim())
    .map((item) => ({
      title: item.text.trim(),
      href: optionalHref(item.url),
    }));

  return {
    // Empty announcements hide the bar; utility/benefits keep static fallbacks.
    announcements,
    utilityItems:
      utilityItems.length > 0
        ? utilityItems
        : FALLBACK_TOP_ADVERTISEMENT.utilityItems,
    benefits:
      benefits.length > 0 ? benefits : FALLBACK_TOP_ADVERTISEMENT.benefits,
  };
}

/**
 * Server-side fetch of top advertisement for the .in storefront.
 * Cached per request via React `cache`. Falls back to static landing data.
 */
export const getTopAdvertisement = cache(
  async (): Promise<StorefrontTopAdvertisement> => {
    try {
      const { readSingleton, withSite } = await import("@/features/cms/store");
      const row = await readSingleton("top-advertisement");
      if (!row) return FALLBACK_TOP_ADVERTISEMENT;
      const data = withSite(row.payload, {
        id: "top-advertisement",
        updatedAt: row.updatedAt,
      }) as unknown as TopAdvertisementConfig;
      if (!data.id) return FALLBACK_TOP_ADVERTISEMENT;
      return mapTopAdvertisementConfigToStorefront(data);
    } catch {
      return FALLBACK_TOP_ADVERTISEMENT;
    }
  },
);
