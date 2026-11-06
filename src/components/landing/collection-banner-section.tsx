"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { StorefrontCollectionBanner } from "@/types/collection-banner";
import { ArrowUpRight } from "lucide-react";

type CollectionBannerSectionProps = {
  banner: StorefrontCollectionBanner;
};

function SlideMedia({
  imageUrl,
  alt,
  href,
  button1Label,
  button1Url,
  button2Label,
  button2Url,
}: {
  imageUrl: string;
  alt: string;
  href: string;
  button1Label: string;
  button1Url: string;
  button2Label: string;
  button2Url: string;
}) {
  const hasButtons = Boolean(
    (button1Label && button1Url) || (button2Label && button2Url),
  );
  const media = imageUrl ? (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      sizes="(max-width: 1024px) 100vw, 55vw"
      priority={false}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
      {alt}
    </div>
  );

  const imageClassName = "absolute inset-0";
  const isExternal = /^https?:\/\//i.test(href);
  const imageLink = href ? (
    isExternal ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={imageClassName}>
        {media}
      </a>
    ) : (
      <Link href={href} className={imageClassName}>
        {media}
      </Link>
    )
  ) : (
    <div className={imageClassName}>{media}</div>
  );

  return (
    <div className="group relative aspect-[4/3] w-full overflow-hidden bg-muted focus-within:ring-2 focus-within:ring-ring sm:aspect-[5/4]">
      {imageLink}
      {hasButtons ? (
        <div className="pointer-events-none absolute bottom-5 left-5 z-10 flex translate-y-4 flex-wrap justify-start gap-3 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
          {button1Label && button1Url ? (
            <HoverButton href={button1Url} label={button1Label} primary />
          ) : null}
          {button2Label && button2Url ? (
            <HoverButton href={button2Url} label={button2Label} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function HoverButton({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  const className = `inline-flex items-center justify-center rounded-full border px-4 py-2 text-xl font-semibold transition-colors ${
    primary
      ? "border-[#d9794c] bg-[#d9794c] text-white hover:bg-[#bd613c]"
      : "border-white/70 bg-[#172c34]/80 text-white backdrop-blur-sm hover:bg-[#172c34]"
  }`;
  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
        <ArrowUpRight className="ml-2 h-4 w-4" />
      </a>
    );
  }
  return <Link href={href} className={className}>{label} <ArrowUpRight className="ml-2 h-4 w-4" /> </Link>;
}

export function CollectionBannerSection({
  banner,
}: CollectionBannerSectionProps) {
  const items = banner.items;
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setActiveIndex(api.selectedScrollSnap());
    };

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  if (items.length === 0) {
    return null;
  }

  const selectSlide = (index: number) => {
    setActiveIndex(index);
    api?.scrollTo(index);
  };

  return (
    <section
      className="container-page section-space"
      aria-labelledby="collection-banner-heading"
    >
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 overflow-hidden">
        <div className="relative bg-surface rounded-xl border border-black">
          <Carousel
            setApi={setApi}
            opts={{ loop: items.length > 1, align: "start" }}
            className="w-full overflow-hidden rounded-xl"
          >
            <CarouselContent>
              {items.map((item) => (
                <CarouselItem key={item.id}>
                  <SlideMedia
                    imageUrl={item.imageUrl}
                    alt={item.alt}
                    href={item.href}
                    button1Label={item.button1Label}
                    button1Url={item.button1Url}
                    button2Label={item.button2Label}
                    button2Url={item.button2Url}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <div className="lg:pt-4">
          <p className="text-md font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            {banner.sectionLabel}
          </p>
          <h2
            id="collection-banner-heading"
            className="mt-3 max-w-md text-4xl font-semibold tracking-tight text-foreground"
          >
            {banner.sectionHeading}
          </h2>

          <div className="relative mt-10">
            <div
              className="absolute top-1 bottom-1 left-0 w-px bg-border"
              aria-hidden
            />

            <ul className="space-y-6">
              {items.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <li key={item.id} className="relative pl-5">
                    <span
                      className={cn(
                        "absolute top-1 left-0 w-0.75 rounded-full bg-foreground transition-all duration-300",
                        isActive ? "h-5 opacity-100" : "h-0 opacity-0",
                      )}
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => selectSlide(index)}
                      className={cn(
                        "w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground/70 hover:text-muted-foreground",
                      )}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <span
                        className={cn(
                          "text-2xl tracking-tight",
                          isActive ? "font-semibold" : "font-normal",
                        )}
                      >
                        {item.title}
                      </span>
                      <span
                        className={cn(
                          "mt-2 block overflow-hidden text-sm leading-relaxed line-clamp-2 text-ellipsis text-muted-foreground transition-all duration-300",
                          isActive
                            ? "max-h-40 opacity-100"
                            : "max-h-0 opacity-0",
                        )}
                      >
                        {item.description}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
