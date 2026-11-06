"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { SocialPost } from "@/types/social-posts";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

type SocialPostsSectionProps = {
  posts: SocialPost[];
};

export function SocialPostsSection({ posts }: SocialPostsSectionProps) {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api || posts.length <= 1) return;

    const timer = window.setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => window.clearInterval(timer);
  }, [api, posts.length]);

  if (posts.length === 0) {
    return null;
  }
  return (
    <section
      className="w-full overflow-hidden py-10 md:py-12"
      aria-label="Social media posts"
    >
      <div className="container-page">
        <div className="mb-8 flex w-full items-center gap-4 sm:mb-10 sm:gap-6">
          <span className="h-px flex-1 bg-[#2f3438]" aria-hidden />
          <p className="shrink-0 text-center text-sm font-bold tracking-[0.08em] text-[#2f3438] uppercase sm:text-base">
            @ Follow us on Instagram
          </p>
          <span className="h-px flex-1 bg-[#2f3438]" aria-hidden />
        </div>

        <Carousel
          opts={{ align: "start", loop: posts.length > 4 }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {posts.map((post) => {
              const isFacebook = post.postType === "facebook";
              const Icon = isFacebook ? FacebookIcon : InstagramIcon;

              // Refined column width: always use column sizing for cards (never full width for 3)
              let cardBasis = "basis-full";
              if (posts.length === 2) {
                cardBasis = "basis-1/4";
              } else if (posts.length === 3) {
                cardBasis = "basis-1/4";
              } else if (posts.length > 3) {
                cardBasis = "basis-1/4";
              }

              return (
                <CarouselItem key={post.id} className={`pl-4 ${cardBasis}`}>
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block h-60 w-full overflow-hidden rounded-md border border-border bg-surface"
                  >
                    <Image
                      src={post.imageUrl}
                      alt={
                        isFacebook
                          ? "Facebook post thumbnail"
                          : "Instagram post thumbnail"
                      }
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 768px) 33vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Icon className="size-10 text-background" />
                      <span className="sr-only">
                        Open {isFacebook ? "Facebook" : "Instagram"} post
                      </span>
                    </div>
                  </a>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          {posts.length > 4 ? (
            <>
              <CarouselPrevious className="left-1 hidden border-border bg-background sm:flex" />
              <CarouselNext className="right-1 hidden border-border bg-background sm:flex" />
            </>
          ) : null}
        </Carousel>
      </div>
    </section>
  );
}
