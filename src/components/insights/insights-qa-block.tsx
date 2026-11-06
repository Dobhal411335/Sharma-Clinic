"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { StorefrontInsightQa } from "@/types/insights";

/** Landing preview height before the single “Read more”. */
const COLLAPSED_MAX_HEIGHT_CLASS = "max-h-80 sm:max-h-80";

export function FadeRichBlock({
  html,
  expanded,
  onToggle,
  className,
}: {
  html: string;
  expanded: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <div
          className={cn(
            "rich-html text-justify text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]",
            !expanded && "max-h-25 overflow-hidden",
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {!expanded ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent"
          />
        ) : null}
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="text-sm font-semibold tracking-wide text-foreground underline decoration-primary decoration-1 underline-offset-4 transition-colors hover:text-primary"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}

type InsightsQaBlockProps = {
  items: StorefrontInsightQa[];
  /**
   * Landing mode: render every Q&A fully, clip the whole list to a max height,
   * and show one “Read more” at the end to reveal the rest.
   */
  collapseWithMaxHeight?: boolean;
};

export function InsightsQaBlock({
  items,
  collapseWithMaxHeight = false,
}: InsightsQaBlockProps) {
  const [expanded, setExpanded] = useState(!collapseWithMaxHeight);

  if (items.length === 0) {
    return null;
  }

  const list = (
    <div className="max-w-7xl space-y-10">
      {items.map((item) => (
        <div key={item.id} className="space-y-3">
          <h3 className="font-body text-2xl font-semibold tracking-tight text-foreground underline decoration-primary decoration-1 underline-offset-4">
            {item.question}
          </h3>
          <div
            className="rich-html text-justify text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]"
            dangerouslySetInnerHTML={{ __html: item.answerHtml }}
          />
        </div>
      ))}
    </div>
  );

  if (!collapseWithMaxHeight) {
    return list;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          className={cn(
            "overflow-hidden",
            !expanded && COLLAPSED_MAX_HEIGHT_CLASS,
          )}
        >
          {list}
        </div>
        {!expanded ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent"
          />
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="text-sm font-semibold tracking-wide text-foreground underline decoration-primary decoration-1 underline-offset-4 transition-colors hover:text-primary"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
