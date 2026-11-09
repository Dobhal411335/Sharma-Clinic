import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FALLBACK_LANDING_FAQS } from "@/features/faq/faq.defaults";
import type { StorefrontFaqItem } from "@/types/faq";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type FaqSectionProps = {
  items?: StorefrontFaqItem[];
};

export function FaqSection({ items }: FaqSectionProps) {
  const faqs = items && items.length > 0 ? items : FALLBACK_LANDING_FAQS;

  return (
    <section className="w-full bg-[#f8f4ec] py-16 sm:py-20 lg:py-24" aria-labelledby="faq-heading">
      <div className="container-page grid items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div className="max-w-xl lg:sticky lg:top-28 lg:self-start">
          <h2
            id="faq-heading"
            className="mt-5 max-w-2xl text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-foreground sm:text-5xl"
          >
            Frequently asked questions
          </h2>
          <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[#ef6a24] to-[#f0d8c9]" />
          <p className="mt-8 max-w-lg text-base leading-relaxed text-[#718087] sm:text-lg">
            Every engagement is different, but these questions help explain how we work.
          </p>
          <Link
            href="/faq"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#ef6a24] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d95e1e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef6a24] focus-visible:ring-offset-2"
          >
            View all FAQs
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="min-h-0 lg:pt-1">
          <Accordion type="single" collapsible>
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border-b border-[#e9d8bd] first:border-t"
              >
                <AccordionTrigger className="rounded-none cursor-pointer px-0 py-6 text-left text-lg font-semibold text-[#17262d] no-underline hover:no-underline focus-visible:ring-2 focus-visible:ring-primary sm:text-xl [&>svg]:hidden!">
                  {faq.question}
                  <span className="flex size-6 shrink-0 items-center justify-center text-2xl font-normal leading-none text-[#b97858]">
                    <span
                      className="transition-opacity font-bold duration-200 group-aria-expanded/accordion-trigger:hidden"
                      aria-hidden
                    >
                      +
                    </span>
                    <span
                      className="hidden transition-opacity font-bold duration-200 group-aria-expanded/accordion-trigger:inline"
                      aria-hidden
                    >
                      −
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-6 pt-0 text-base leading-relaxed text-[#718087]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
