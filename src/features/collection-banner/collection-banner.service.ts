import { cache } from "react";

import { FALLBACK_COLLECTION_BANNER } from "@/features/collection-banner/collection-banner.defaults";
import type {
  CollectionBannerConfigDto,
  StorefrontCollectionBanner,
} from "@/types/collection-banner";

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

function preferHttps(url: string): string {
  if (url.startsWith("http://res.cloudinary.com/")) {
    return `https://${url.slice("http://".length)}`;
  }
  return url;
}

function optionalHref(url: string | undefined): string {
  const trimmed = url?.trim();
  if (!trimmed || trimmed === "#") return "";
  return trimmed;
}

export function mapCollectionBannerConfigToStorefront(
  config: CollectionBannerConfigDto,
): StorefrontCollectionBanner {
  const items = (config.items || [])
    .filter((item) => item.active && item.title.trim())
    .map((item) => ({
      id: item.id,
      title: item.title.trim(),
      description: item.description.trim(),
      imageUrl: preferHttps(item.imageUrl.trim()),
      href: optionalHref(item.buttonUrl),
      button1Label: item.button1Label?.trim() || "",
      button1Url: optionalHref(item.button1Url),
      button2Label: item.button2Label?.trim() || "",
      button2Url: optionalHref(item.button2Url),
      alt: item.title.trim(),
    }));

  return {
    sectionLabel:
      config.sectionLabel.trim() || FALLBACK_COLLECTION_BANNER.sectionLabel,
    sectionHeading:
      config.sectionHeading.trim() || FALLBACK_COLLECTION_BANNER.sectionHeading,
    items,
  };
}

export const getCollectionBanner = cache(
  async (): Promise<StorefrontCollectionBanner> => {
    try {
      const { readSingleton, withSite } = await import("@/features/cms/store");
      const row = await readSingleton("collection-banner");
      if (!row) return FALLBACK_COLLECTION_BANNER;
      const data = withSite(row.payload, {
        id: "collection-banner",
        updatedAt: row.updatedAt,
      }) as unknown as CollectionBannerConfigDto;
      return mapCollectionBannerConfigToStorefront(data);
    } catch {
      return FALLBACK_COLLECTION_BANNER;
    }
  },
);
