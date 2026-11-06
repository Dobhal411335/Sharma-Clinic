"use client";

import { ArrowUpRight, Pause, Play, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useCarouselAutoplay } from "@/hooks/useCarouselAutoplay";
import { cn } from "@/lib/utils";
import type { CustomerReview } from "@/types/customer-reviews";

const HOME_TESTIMONIAL_LIMIT = 10;

type TestimonialsGridProps = {
  reviews?: CustomerReview[];
};

function getReviewHeading(review: CustomerReview): string {
  const customHeading =
    (review as unknown as { heading?: string; title?: string }).heading ||
    (review as unknown as { heading?: string; title?: string }).title;
  if (customHeading && customHeading.trim()) {
    return customHeading.trim();
  }
  const rating = Math.min(5, Math.max(1, Math.round(review.rating)));
  switch (rating) {
    case 5:
      return "Perfection";
    case 4:
      return "Great Experience";
    case 3:
      return "Good Service";
    default:
      return "Customer Feedback";
  }
}

function ReviewCard({ review }: { review: CustomerReview }) {
  const rating = Math.min(5, Math.max(1, Math.round(review.rating)));
  const initials = review.customerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  const heading = getReviewHeading(review);

  return (
    <figure className="flex h-full w-full flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-7 text-left shadow-[0_2px_12px_rgba(20,30,40,0.06)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(20,30,40,0.1)] sm:p-8">
      <div className="space-y-5">
        <div className="flex items-center gap-1.5" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "size-5",
                i < rating ? "fill-[#ef6a24] text-[#ef6a24]" : "fill-transparent text-[#ef6a24]/30",
              )}
              aria-hidden
            />
          ))}
        </div>

        <h3 className="text-lg font-semibold tracking-tight text-[#17283d] sm:text-xl">
          {heading}
        </h3>

        <blockquote className="text-base italic leading-relaxed text-[#34475c] line-clamp-6 sm:text-[1.05rem]">
          {review.description}
        </blockquote>
      </div>

      <figcaption className="mt-8 flex items-center gap-3 border-t border-[#e8e5df] pt-5">
        <Avatar size="xl">
          <AvatarImage src={review.imageUrl} alt={review.customerName} />
          <AvatarFallback className="bg-[#ef6a24]/10 text-xs font-semibold text-[#ef6a24]">
            {initials || "CU"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#17283d]">{review.customerName}</p>
          {review.designation ? (
            <p className="truncate text-xs text-[#657487]">{review.designation}</p>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}

export function TestimonialsGrid({ reviews = [] }: TestimonialsGridProps) {
  const visibleReviews = reviews.slice(0, HOME_TESTIMONIAL_LIMIT);
  const [api, setApi] = useState<CarouselApi>();
  const [isPaused, setIsPaused] = useState(false);

  useCarouselAutoplay(api, {
    enabled: visibleReviews.length > 1,
    paused: isPaused,
    intervalMs: 5000,
  });

  if (visibleReviews.length === 0) {
    return null;
  }

  return (
    <section
      className="overflow-hidden border-y border-[#e8e5df] bg-[#f7f5f1]"
      aria-labelledby="testimonials-heading"
    >
      <div className="container-page section-space py-16 sm:py-20 lg:py-24">
        <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="w-full">
          <div className="relative mb-10 flex items-end justify-between gap-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold tracking-[0.18em] text-[#ef6a24] uppercase">
                Community voices
              </p>
              <h2
                id="testimonials-heading"
                className="mt-5 max-w-2xl text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-foreground sm:text-5xl"
              >
                What our customers say
              </h2>
              <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[#ef6a24] to-[#f0d8c9]" />
            </div>

            {visibleReviews.length > 4 ? (
              <div className="z-10 flex shrink-0 items-center gap-2">
                <CarouselPrevious className="static inset-auto size-10 translate-y-0 border-[#dedbd5] bg-white text-[#17283d] shadow-sm" />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-10 rounded-full border-[#dedbd5] bg-white text-[#17283d] shadow-sm"
                  onClick={() => setIsPaused((prev) => !prev)}
                  aria-label={
                    isPaused ? "Play testimonials carousel" : "Pause testimonials carousel"
                  }
                >
                  {isPaused ? (
                    <Play className="size-3.5 fill-current" aria-hidden />
                  ) : (
                    <Pause className="size-3.5 fill-current" aria-hidden />
                  )}
                </Button>
                <CarouselNext className="static inset-auto size-10 translate-y-0 border-[#dedbd5] bg-white text-[#17283d] shadow-sm" />
              </div>
            ) : null}
          </div>

          <CarouselContent className="-ml-5 py-2">
            {visibleReviews.map((review) => (
              <CarouselItem
                key={review.id}
                className="flex basis-full pl-5 sm:basis-1/2 lg:basis-1/3"
              >
                <ReviewCard review={review} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="mt-10 flex justify-center">
          <Link
            href="/testimonials"
            className="inline-flex w-fit items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-primary/90"
          >
            View all testimonials
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
