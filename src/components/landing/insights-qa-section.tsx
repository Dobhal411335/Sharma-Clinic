import Link from "next/link";

import { InsightsQaBlock } from "@/components/insights/insights-qa-block";
import { insightsQaIntro } from "@/data/landing";
import type { StorefrontInsightQa } from "@/types/insights";

type InsightsQaSectionProps = {
  items?: StorefrontInsightQa[];
};

export function InsightsQaSection({ items = [] }: InsightsQaSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="container-page section-space"
      aria-labelledby="insights-qa-heading"
    >
      <div className="mb-8 flex max-w-5xl flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="insights-qa-heading"
            className="font-body text-4xl font-semibold tracking-tight text-secondary"
          >
            #{insightsQaIntro.title}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {insightsQaIntro.subtitle}
          </p>
        </div>
      </div>

      <InsightsQaBlock items={items} collapseWithMaxHeight />
    </section>
  );
}
