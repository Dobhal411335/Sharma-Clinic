import { faqCategories } from "@/data/faq";
import { faqs } from "@/data/landing";
import type { StorefrontFaqItem, StorefrontFaqSection } from "@/types/faq";

export const FALLBACK_LANDING_FAQS: StorefrontFaqItem[] = faqs.map((item) => ({
  id: item.id,
  question: item.question,
  answer: item.answer,
}));

export const FALLBACK_FAQ_SECTIONS: StorefrontFaqSection[] = faqCategories.map(
  (category) => ({
    id: category.id,
    title: category.title,
    items: category.items.map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
    })),
  }),
);
