import { cache } from "react";

import { FALLBACK_INSIGHTS } from "@/features/insights/insights.defaults";
import type {
  InsightsConfig,
  StorefrontInsightCard,
  StorefrontInsightQa,
  StorefrontInsights,
} from "@/types/insights";

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

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function makeExcerpt(html: string, maxLength = 140): string {
  const text = stripHtmlToText(html);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function mapInsightsConfig(config: InsightsConfig): StorefrontInsights {
  const cards: StorefrontInsightCard[] = [...(config.cards || [])]
    .filter((card) => card.active !== false)
    .sort((left, right) => (left.order || 0) - (right.order || 0))
    .map((card) => ({
      id: card.id,
      category: card.category,
      name: card.name,
      publishedAt: card.publishedAt,
      imageUrl: card.imageUrl,
      descriptionHtml: card.description || "",
      excerpt: makeExcerpt(card.description || ""),
    }));

  const qaItems: StorefrontInsightQa[] = [...(config.qaItems || [])]
    .filter((item) => item.active !== false)
    .sort((left, right) => (left.order || 0) - (right.order || 0))
    .map((item) => ({
      id: item.id,
      question: item.question,
      answerHtml: item.answer || "",
    }));

  return { cards, qaItems };
}

async function fetchInsightsConfig(): Promise<InsightsConfig | null> {
  const base = apiBaseUrl();
  if (!base) {
    return null;
  }

  try {
    const response = await fetch(
      `${base}/sites/${STOREFRONT_SITE_CODE}/insights`,
      {
        next: { revalidate: 60, tags: ["insights", "IN"] },
        headers: { Accept: "application/json" },
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiSuccess<InsightsConfig>;
    if (
      !payload?.success ||
      !payload.data ||
      !Array.isArray(payload.data.cards) ||
      !Array.isArray(payload.data.qaItems)
    ) {
      return null;
    }

    return payload.data;
  } catch {
    return null;
  }
}

/**
 * Landing Insights: active cards + Q&A. Falls back to static content when empty/unavailable.
 */
export const getLandingInsights = cache(async (): Promise<StorefrontInsights> => {
  const config = await fetchInsightsConfig();
  if (!config) {
    return FALLBACK_INSIGHTS;
  }

  const mapped = mapInsightsConfig(config);
  if (mapped.cards.length === 0 && mapped.qaItems.length === 0) {
    return FALLBACK_INSIGHTS;
  }

  return mapped;
});
