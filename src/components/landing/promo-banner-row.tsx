"use client";

import Link from "next/link";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FALLBACK_PROMO_BANNERS } from "@/features/promo-banner/promo-banner.defaults";
import type { StorefrontPromoBanner } from "@/types/promo-banner";

type PromoBannerRowProps = {
  items?: StorefrontPromoBanner[];
};

const PROMO_TONES = [
  {
    card: "bg-[#e8f4f0]",
    accent: "bg-[#cfe6df]",
    eyebrow: "text-[#006f70]",
    button: "bg-[#007d7d] text-white hover:bg-[#006666]",
  },
  {
    card: "bg-[#eaf1fb]",
    accent: "bg-[#d4e0f0]",
    eyebrow: "text-[#355d88]",
    button: "bg-[#466987] text-white hover:bg-[#375674]",
  },
  {
    card: "bg-[#f1f0ed]",
    accent: "bg-[#e2e1dc]",
    eyebrow: "text-[#6d6b63]",
    button: "bg-white text-[#1d2529] shadow-sm hover:bg-white/80",
  },
  {
    card: "bg-[#f8eee8]",
    accent: "bg-[#eed8cc]",
    eyebrow: "text-[#a05f43]",
    button: "bg-[#a9684d] text-white hover:bg-[#8f543d]",
  },
] as const;

function PromoCta({ href, label, className }: { href: string; label: string; className: string }) {
  const isExternal = /^https?:\/\//i.test(href);
  const classes = `mt-1 inline-flex w-fit items-center rounded-lg px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`;

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {label}
    </Link>
  );
}

function PromoTile({ item, index }: { item: StorefrontPromoBanner; index: number }) {
  const showCta = Boolean(item.buttonLabel && item.href);
  const tone = PROMO_TONES[index % PROMO_TONES.length]!;

  return (
    <article
      className={`group relative flex h-full min-h-[10.5rem] overflow-hidden rounded-xl ${tone.card}`}
    >
      <div
        aria-hidden
        className={`absolute right-0 bottom-0 h-24 w-24 origin-bottom-right rounded-tl-[20px] ${tone.accent} transition-transform duration-300 ease-out group-hover:scale-110 sm:h-28 sm:w-28`}
      />
      <div className="relative z-10 flex max-w-[88%] flex-col justify-center gap-2.5 p-6 sm:max-w-[82%] sm:p-7">
        {item.miniHeading ? (
          <p className={`text-[12px] font-bold tracking-[0.12em] uppercase ${tone.eyebrow}`}>
            {item.miniHeading}
          </p>
        ) : null}
        {item.heading ? (
          <h3 className="text-xl leading-snug font-semibold text-[#07151d] sm:text-[1.65rem]">
            {item.heading}
          </h3>
        ) : null}
        {item.description ? (
          <p className="max-w-[34rem] text-sm leading-relaxed text-[#29404a] sm:text-base">
            {item.description}
          </p>
        ) : null}
        {showCta ? (
          <PromoCta href={item.href} label={item.buttonLabel} className={tone.button} />
        ) : item.buttonLabel ? (
          <span
            className={`mt-1 inline-flex w-fit items-center rounded-lg px-5 py-3 text-sm font-semibold ${tone.button}`}
          >
            {item.buttonLabel}
          </span>
        ) : null}
      </div>
    </article>
  );
}

export function PromoBannerRow({ items = FALLBACK_PROMO_BANNERS }: PromoBannerRowProps) {
  if (items.length === 0) {
    return null;
  }

  const showControls = items.length > 3;

  return (
    <section className="container-page py-12 lg:py-16" aria-label="Promotional banners">
      <Carousel opts={{ align: "start", loop: showControls }} className="w-full">
        {showControls ? (
          <div className="mb-4 flex justify-end gap-2">
            <CarouselPrevious className="static inset-auto size-8 translate-y-0 border-border bg-background/90 text-foreground shadow-sm" />
            <CarouselNext className="static inset-auto size-8 translate-y-0 border-border bg-background/90 text-foreground shadow-sm" />
          </div>
        ) : null}

        <CarouselContent className="-ml-4">
          {items.map((item, index) => (
            <CarouselItem key={item.id} className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3">
              <PromoTile item={item} index={index} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
