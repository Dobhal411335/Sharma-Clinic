import Link from "next/link";

import { InsightsQaBlock } from "@/components/insights/insights-qa-block";
import { insightsQaIntro } from "@/data/landing";
import type { StorefrontInsightQa } from "@/types/insights";

type InsightsQaPageViewProps = {
  items: StorefrontInsightQa[];
};

export function InsightsQaPageView({ items }: InsightsQaPageViewProps) {
  return (
    <div className="container-page section-space">
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Insights</span>
      </nav>

      <h1 className="font-display text-3xl font-semibold tracking-tight text-secondary sm:text-4xl">
        {insightsQaIntro.title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {insightsQaIntro.subtitle}
      </p>

      <div className="mt-10">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Questions will appear here once published in admin.
          </p>
        ) : (
          <InsightsQaBlock items={items} />
        )}
      </div>
    </div>
  );
}
