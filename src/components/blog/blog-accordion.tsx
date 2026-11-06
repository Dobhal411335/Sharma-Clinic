"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { StorefrontBlogAccordionItem } from "@/types/blog";

type BlogAccordionProps = {
  items: StorefrontBlogAccordionItem[];
};

export function BlogAccordion({ items }: BlogAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 space-y-3" aria-label="Article questions">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `blog-accordion-panel-${index}`;
        const triggerId = `blog-accordion-trigger-${index}`;

        return (
          <div
            key={`${item.question}-${index}`}
            className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
              isOpen
                ? "border-[#d9c4b0] bg-[#f7f1ea]"
                : "border-[#eadfce] bg-[#faf6f1]"
            }`}
          >
            <button
              type="button"
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-300 hover:bg-[#f3ebe1] sm:px-6 sm:py-5"
            >
              <span className="text-base font-semibold text-[#1d262b] sm:text-lg">
                {item.question || `Question ${index + 1}`}
              </span>
              <ChevronDown
                className={`size-5 shrink-0 text-[#c97852] transition-transform duration-300 ease-out ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
                aria-hidden
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-[#eadfce] px-5 py-4 text-sm leading-relaxed text-[#6d787e] sm:px-6 sm:py-5 sm:text-base">
                  {item.description || "No details added yet."}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
