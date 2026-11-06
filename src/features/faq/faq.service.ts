import { cache } from "react";

import {
  FALLBACK_FAQ_SECTIONS,
  FALLBACK_LANDING_FAQS,
} from "@/features/faq/faq.defaults";
import type {
  FaqConfig,
  StorefrontFaqItem,
  StorefrontFaqSection,
} from "@/types/faq";

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

export function mapFaqConfigToSections(config: FaqConfig): StorefrontFaqSection[] {
  return [...(config.sections || [])]
    .filter((section) => section.active !== false)
    .sort((left, right) => (left.order || 0) - (right.order || 0))
    .map((section) => ({
      id: section.id,
      title: section.title,
      items: [...(section.items || [])]
        .filter((item) => item.active !== false)
        .sort((left, right) => (left.order || 0) - (right.order || 0))
        .map((item) => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
        })),
    }))
    .filter((section) => section.items.length > 0);
}

export function mapFaqConfigToLandingItems(config: FaqConfig): StorefrontFaqItem[] {
  return [...(config.sections || [])]
    .filter((section) => section.active !== false)
    .sort((left, right) => (left.order || 0) - (right.order || 0))
    .flatMap((section) =>
      [...(section.items || [])]
        .filter((item) => item.active !== false && item.showOnLanding)
        .sort((left, right) => (left.order || 0) - (right.order || 0))
        .map((item) => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
        })),
    );
}

async function fetchFaqConfig(_landingOnly: boolean): Promise<FaqConfig | null> {
  try {
    const { readSingleton, CLINIC_SITE_CODE } = await import("@/features/cms/store");
    const row = await readSingleton("faq");
    if (!row) return null;
    const sections = Array.isArray(row.payload.sections) ? row.payload.sections : [];
    return { siteCode: CLINIC_SITE_CODE, sections } as FaqConfig;
  } catch {
    return null;
  }
}

/**
 * Full FAQ page: active sections and items. Falls back to static categories.
 */
export const getFaqSections = cache(async (): Promise<StorefrontFaqSection[]> => {
  const config = await fetchFaqConfig(false);
  if (!config) {
    return FALLBACK_FAQ_SECTIONS;
  }

  const mapped = mapFaqConfigToSections(config);
  return mapped.length > 0 ? mapped : FALLBACK_FAQ_SECTIONS;
});

/**
 * Landing snippet: only items flagged showOnLanding. Falls back to static FAQs.
 */
export const getLandingFaqs = cache(async (): Promise<StorefrontFaqItem[]> => {
  const config = await fetchFaqConfig(true);
  if (!config) {
    return FALLBACK_LANDING_FAQS;
  }

  const mapped = mapFaqConfigToLandingItems(config);
  return mapped.length > 0 ? mapped : FALLBACK_LANDING_FAQS;
});
