"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { FALLBACK_HERO_SLIDES } from "@/features/hero-banner/hero-banner.defaults";
import { useCarouselAutoplay } from "@/hooks/useCarouselAutoplay";
import type { StorefrontHeroSlide } from "@/types/hero-banner";

type HeroSectionProps = {
  slides?: StorefrontHeroSlide[];
};

/** Shared frame so every layout matches in the carousel (avoids white gaps). */
const HERO_FRAME = "h-[32rem] w-full overflow-hidden sm:h-[36rem] lg:h-[40rem]";

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

function HeroClickable({
  href,
  className,
  children,
  ariaLabel,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const target = href?.trim();
  if (!target || target === "#") {
    return <div className={className}>{children}</div>;
  }

  const isExternal = /^https?:\/\//i.test(target);
  if (isExternal) {
    return (
      <a
        href={target}
        className={className}
        aria-label={ariaLabel}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={target} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

function FullWidthSlide({ slide, priority }: { slide: StorefrontHeroSlide; priority?: boolean }) {
  const isMobile = useIsMobileViewport();
  const src =
    (isMobile ? slide.mobileImageUrl : slide.desktopImageUrl) ||
    slide.desktopImageUrl ||
    slide.mobileImageUrl;

  if (!src) return null;

  return (
    <HeroClickable
      href={slide.buttonUrl}
      className={`relative overflow-hidden block ${HERO_FRAME}`}
      ariaLabel="Hero banner"
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover transition-transform duration-300 ease-out hover:scale-[1.03]"
        sizes="100vw"
        priority={priority}
      />
    </HeroClickable>
  );
}

function accentLastWord(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace === -1) {
    return <span className="font-display italic font-medium">{trimmed}</span>;
  }

  return (
    <>
      {trimmed.slice(0, lastSpace)}{" "}
      <span className="font-serif italic font-medium text-[#d9794c]">{trimmed.slice(lastSpace + 1)}</span>
    </>
  );
}

function SplitCopy({ slide }: { slide: StorefrontHeroSlide }) {
  return (
    <>
      {slide.miniHeading ? <p className="text-sm tracking-wide">{slide.miniHeading}</p> : null}
      <h1 className="font-bold mt-3 text-4xl tracking-tight sm:text-5xl">{slide.mainHeading}</h1>
      {slide.description ? (
        <p className="mt-4 max-w-md text-sm leading-relaxed opacity-90 ">{slide.description}</p>
      ) : null}
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
        {slide.buttonLabel ? (
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white border-2 bg-primary-foreground text-primary hover:bg-transparent px-10 py-7 rounded hover:text-primary-foreground"
          >
            <Link href={slide.buttonUrl}>
              {slide.buttonLabel} <ArrowUpRight className="size-6 ml-2" />
            </Link>
          </Button>
        ) : null}
        {slide.button2Label ? (
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white rounded border-2 bg-primary-foreground text-primary px-10 py-7 hover:bg-transparent hover:text-primary-foreground"
          >
            <Link href={slide.button2Url}>
              {slide.button2Label} <ArrowUpRight className="size-6" />
            </Link>
          </Button>
        ) : null}
      </div>
    </>
  );
}

function SplitDualSlide({ slide, priority }: { slide: StorefrontHeroSlide; priority?: boolean }) {
  const isMobile = useIsMobileViewport();
  const mobileSrc = slide.leftImageUrl || slide.rightImageUrl;

  if (isMobile) {
    const mobileImageClickUrl = slide.leftImageUrl
      ? slide.leftImageClickUrl
      : slide.rightImageClickUrl;

    return (
      <div className={`relative ${HERO_FRAME}`}>
        {mobileSrc ? (
          <HeroClickable
            href={mobileImageClickUrl}
            className="absolute inset-0"
            ariaLabel="Open hero image"
          >
            <Image
              src={mobileSrc}
              alt=""
              fill
              className="object-cover transition-transform duration-300 ease-out hover:scale-[1.03]"
              sizes="100vw"
              priority={priority}
            />
          </HeroClickable>
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-primary/70" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-16 text-center text-primary-foreground">
          <SplitCopy slide={slide} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid ${HERO_FRAME} lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)_minmax(0,500px)]`}
    >
      <div className="relative h-full min-h-0 bg-muted">
        {slide.leftImageUrl ? (
          <HeroClickable
            href={slide.leftImageClickUrl}
            className="relative block overflow-hidden size-full"
            ariaLabel="Open left hero image"
          >
            <Image
              src={slide.leftImageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-300 ease-out hover:scale-[1.03]"
              sizes="350px"
              priority={priority}
            />
          </HeroClickable>
        ) : null}
      </div>

      <div className="flex h-full flex-col items-center justify-center bg-primary px-6 py-12 text-center text-primary-foreground">
        <SplitCopy slide={slide} />
      </div>

      <div className="relative h-full min-h-0 bg-muted">
        {slide.rightImageUrl ? (
          <HeroClickable
            href={slide.rightImageClickUrl}
            className="relative overflow-hidden block size-full"
            ariaLabel="Open right hero image"
          >
            <Image
              src={slide.rightImageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-300 ease-out hover:scale-[1.03]"
              sizes="350px"
              priority={priority}
            />
          </HeroClickable>
        ) : null}
      </div>
    </div>
  );
}

function MultiImageSlide({ slide }: { slide: StorefrontHeroSlide }) {
  const images = slide.gridImages;
  const lastRowStart = images.length - (images.length % 2 === 0 ? 2 : 1);

  return (
    <div
      className={`relative flex ${HERO_FRAME} items-center justify-center border-b border-[#263b43] bg-[#14272e] text-white`}
    >
      <div className="container-page flex h-full w-full flex-col items-center justify-center gap-10 py-10 lg:flex-row lg:justify-center lg:gap-[18%] lg:py-12">
        <div className="max-w-xl text-center lg:text-left">
          {slide.miniHeading ? (
            <div className="flex items-center justify-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-[#e7aa87] uppercase lg:justify-start">
              <span className="h-px w-8 bg-[#d9794c]" aria-hidden />
              <span>{slide.miniHeading}</span>
            </div>
          ) : null}
          <h2 className="mt-7 text-5xl leading-[0.94] font-semibold tracking-[-0.05em] sm:text-6xl">
            {accentLastWord(slide.mainHeading)}
          </h2>
          {slide.description ? (
            <p className="mt-7 max-w-lg text-base leading-relaxed text-[#b5c2c6] sm:text-lg">
              {slide.description}
            </p>
          ) : null}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            {slide.buttonLabel ? (
              <Button
                asChild
                size="lg"
                className="rounded-full border border-[#d9794c] bg-[#d9794c] px-7 py-6 text-white hover:bg-[#bd613c]"
              >
                <Link href={slide.buttonUrl}>
                  {slide.buttonLabel} <ArrowUpRight className="ml-2 size-4" />
                </Link>
              </Button>
            ) : null}
            {slide.button2Label ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/35 bg-transparent px-7 py-6 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href={slide.button2Url}>
                  {slide.button2Label} <ArrowUpRight className="ml-2 size-4" />
                </Link>
              </Button>
            ) : null}
          </div>

          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <div className="flex -space-x-3" aria-label="Leadership team testimonials">
              {["person1.jpg", "person2.jpg", "person3.jpg", "person4.jpg"].map(
                (person, index) => (
                  <div
                    key={person}
                    className="relative size-11 overflow-hidden rounded-full border-2 border-[#14272e] bg-[#203640] shadow-sm"
                  >
                    <Image
                      src={`/person/${person}`}
                      alt={`Leadership team member ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                ),
              )}
            </div>
            <div className="text-center sm:text-left">
              <div className="text-base leading-none tracking-[0.18em] text-[#f0a15f]" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <p className="mt-2 text-xs font-medium text-[#b5c2c6] sm:text-base">
                Trusted by 180+ leadership teams worldwide
              </p>
            </div>
          </div>
        </div>

        <div
          className="grid shrink-0 grid-cols-2 overflow-hidden rounded-[3px] border border-white/40"
          role="list"
          aria-label="Associate brands"
        >
          {images.map((image, index) => {
            const isLeftCol = index % 2 === 0;
            const isNotLastRow = index < lastRowStart;

            return (
              <div
                key={image.id}
                role="listitem"
                className={[
                  "relative h-[150px] w-[150px] overflow-hidden sm:h-[190px] sm:w-[190px] lg:h-[220px] lg:w-[220px]",
                  isLeftCol ? "border-r border-white/40" : "",
                  isNotLastRow ? "border-b border-white/40" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <HeroClickable
                  href={image.clickUrl}
                  className="group relative block size-full overflow-hidden"
                  ariaLabel={`Open ${image.alt}`}
                >
                  {image.src ? (
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-contain p-5 transition-transform duration-300 ease-out hover:scale-[1.04]"
                      sizes="250px"
                    />
                  ) : (
                    <span
                      className="flex size-full items-center justify-center text-sm font-bold tracking-wide text-foreground transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                      aria-hidden
                    >
                      {image.alt
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || "SB"}
                    </span>
                  )}
                </HeroClickable>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HeroSlideView({ slide, priority }: { slide: StorefrontHeroSlide; priority?: boolean }) {
  if (slide.layoutType === "FULL_WIDTH") {
    return <FullWidthSlide slide={slide} priority={priority} />;
  }
  if (slide.layoutType === "SPLIT_DUAL") {
    return <SplitDualSlide slide={slide} priority={priority} />;
  }
  return <MultiImageSlide slide={slide} />;
}

function HeroCarousel({ slides }: { slides: StorefrontHeroSlide[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useCarouselAutoplay(api, {
    enabled: slides.length > 1,
    intervalMs: 6000,
    paused: isPaused,
  });

  if (slides.length === 1) {
    return <HeroSlideView slide={slides[0]!} priority />;
  }

  return (
    <div
      className="relative isolate"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      <Carousel setApi={setApi} opts={{ loop: true, align: "start" }} className="w-full">
        <CarouselContent className="-ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} className={`pl-0 basis-full ${HERO_FRAME}`}>
              <HeroSlideView slide={slide} priority={index === 0} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <Button
        type="button"
        size="icon"
        variant="outline"
        className="absolute top-1/2 left-2 z-20 size-12 -translate-y-1/2 rounded-full border-white/60 bg-black/35 text-white shadow-lg hover:bg-black/55 hover:text-white active:not-aria-[haspopup]:translate-y-0 sm:left-4 sm:size-14"
        onClick={() => api?.scrollPrev()}
        aria-label="Previous hero slide"
      >
        <ChevronLeft className="size-6 sm:size-7" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="absolute top-1/2 right-2 z-20 size-12 -translate-y-1/2 rounded-full border-white/60 bg-black/35 text-white shadow-lg hover:bg-black/55 hover:text-white active:not-aria-[haspopup]:translate-y-0 sm:right-4 sm:size-14"
        onClick={() => api?.scrollNext()}
        aria-label="Next hero slide"
      >
        <ChevronRight className="size-6 sm:size-7" />
      </Button>

      <div
        className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-2.5"
        role="tablist"
        aria-label="Hero slides"
      >
        {slides.map((slide, index) => {
          const active = selected === index;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`Go to slide ${index + 1}`}
              className={[
                "transition-all duration-300",
                active
                  ? "h-2.5 w-8 rounded-full bg-white"
                  : "size-2.5 rounded-full bg-white/60 hover:bg-white",
              ].join(" ")}
              onClick={() => api?.scrollTo(index)}
            />
          );
        })}
      </div>
    </div>
  );
}

export function HeroSection({ slides = FALLBACK_HERO_SLIDES }: HeroSectionProps) {
  return (
    <section aria-label="Hero" className="border-b border-border">
      <HeroCarousel slides={slides.length > 0 ? slides : FALLBACK_HERO_SLIDES} />
    </section>
  );
}
