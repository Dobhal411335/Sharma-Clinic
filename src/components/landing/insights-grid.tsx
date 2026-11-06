"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { StorefrontInsightCard, StorefrontInsights } from "@/types/insights";

function formatInsightDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function InsightCardItem({ card }: { card: StorefrontInsightCard }) {
  const [open, setOpen] = useState(false);
  const fullDescription = card.descriptionHtml?.trim() || card.excerpt?.trim() || "";
  const hasDescription = Boolean(fullDescription);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#ece7de]">
        {card.imageUrl.trim() ? (
          <Image
            src={card.imageUrl}
            alt={card.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        {card.category ? (
          <span className="absolute top-4 left-4 rounded-full bg-white/85 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-[#755c43] uppercase backdrop-blur-sm">
            {card.category}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <p className="text-xs text-muted-foreground">{formatInsightDate(card.publishedAt)}</p>
        <h3 className="line-clamp-2 font-display text-lg leading-snug font-semibold text-[#18252b]">
          {card.name}
        </h3>
        {hasDescription ? (
          <div
            className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
              open ? "max-h-60 opacity-100" : "max-h-[4.75rem] opacity-90"
            }`}
          >
            <div
              className={`rich-html text-sm leading-relaxed text-muted-foreground ${
                open ? "" : "line-clamp-3"
              }`}
              dangerouslySetInnerHTML={{ __html: fullDescription }}
            />
          </div>
        ) : null}
        {hasDescription ? (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="mt-auto inline-flex w-fit items-center gap-1 pt-2 text-xs font-bold tracking-[0.12em] text-[#18252b] uppercase transition-colors hover:text-primary"
          >
            {open ? "Show less" : "Read more"}
            <ArrowRight
              className={`size-3.5 transition-transform duration-300 ${open ? "rotate-90" : ""}`}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
    </article>
  );
}

type InsightsGridProps = {
  insights?: StorefrontInsights;
};

export function InsightsGrid({ insights }: InsightsGridProps) {
  const cards = insights?.cards ?? [];
  if (cards.length === 0) return null;

  const showControls = cards.length > 3;

  return (
    <section className="w-full bg-white py-14 sm:py-16" aria-labelledby="insights-heading">
      <div className="container-page">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[#ef6a24] uppercase">
              Related insights
            </p>
            <h2
              id="insights-heading"
              className="mt-5 max-w-2xl text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-foreground sm:text-5xl"
            >
              Continue exploring.
            </h2>
            <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[#ef6a24] to-[#f0d8c9]" />
          </div>
        </div>

        <Carousel opts={{ align: "start", loop: showControls }} className="w-full">
          <CarouselContent className="-ml-4">
            {cards.map((card) => (
              <CarouselItem key={card.id} className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3">
                <InsightCardItem card={card} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {showControls ? (
            <>
              <CarouselPrevious className="-left-3 hidden border-[#d8c9b5] bg-white text-[#18252b] shadow-sm sm:flex" />
              <CarouselNext className="-right-3 hidden border-[#d8c9b5] bg-white text-[#18252b] shadow-sm sm:flex" />
            </>
          ) : null}
        </Carousel>
      </div>
    </section>
  );
}
