import type { StorefrontInsights } from "@/types/insights";

/** Optional static fallback when CMS insights are empty or unavailable. */
export const FALLBACK_INSIGHTS: StorefrontInsights = {
  cards: [
    {
      id: "fallback-card-1",
      category: "Education",
      name: "How to read an ingredients list with clarity",
      publishedAt: "2026-05-15T00:00:00.000Z",
      imageUrl:
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80",
      descriptionHtml:
        "<p>A practical guide to scanning labels without jargon overload — focused on transparency, not medical advice.</p>",
      excerpt:
        "A practical guide to scanning labels without jargon overload — focused on transparency, not medical advice.",
    },
    {
      id: "fallback-card-2",
      category: "Wellness tips",
      name: "Building a simple morning routine",
      publishedAt: "2026-05-02T00:00:00.000Z",
      imageUrl:
        "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80",
      descriptionHtml:
        "<p>Cleanse, treat, moisturise, protect — a calm sequence you can adapt to your own skin needs.</p>",
      excerpt:
        "Cleanse, treat, moisturise, protect — a calm sequence you can adapt to your own skin needs.",
    },
    {
      id: "fallback-card-3",
      category: "Brand",
      name: "What clinical calm means for our packaging",
      publishedAt: "2026-04-20T00:00:00.000Z",
      imageUrl:
        "https://images.unsplash.com/photo-1620916297397-a4a33220b72c?auto=format&fit=crop&w=800&q=80",
      descriptionHtml:
        "<p>Why we prioritise legible typography, clear pack sizes, and honest product photography.</p>",
      excerpt:
        "Why we prioritise legible typography, clear pack sizes, and honest product photography.",
    },
  ],
  qaItems: [
    {
      id: "fallback-qa-1",
      question: "How do I choose products for my routine?",
      answerHtml:
        "<p>Start with cleanse, treat, moisturise, and protect. Match textures to your climate and comfort — and follow the guidance on each pack.</p>",
    },
    {
      id: "fallback-qa-2",
      question: "Where can I find ingredient information?",
      answerHtml:
        "<p>Each product page lists approved details from our catalogue. Store content is informational and does not diagnose or prescribe.</p>",
    },
  ],
};
