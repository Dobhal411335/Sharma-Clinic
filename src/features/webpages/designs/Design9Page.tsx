// @ts-nocheck — ported from Hotel WebPage.jsx; keep visual parity.
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Quote,
} from "lucide-react";
import {
  AuthorCard,
  GetInTouchCard,
  HtmlBlock,
  ImageDotsCarousel,
  ShareCard,
  StaticSidebarCard,
  cleanObjectArray,
  cleanTextArray,
  formatDate,
  isFilledText,
} from "@/features/webpages/webpage-shared";
import type { StorefrontWebpage } from "@/features/webpages/webpage.types";



export function Design9Page({ data }: { data: StorefrontWebpage }) {
  const designHeaderDesktop =
    data.bannerImage?.url ||
    data.imageFirst?.url ||
    data.bannerImageMobile?.url ||
    data.imageFirstMobile?.url ||
    "";
  const designHeaderMobile =
    data.bannerImageMobile?.url ||
    data.imageFirstMobile?.url ||
    data.bannerImage?.url ||
    data.imageFirst?.url ||
    "";
  const bannerImageDesktop = data.bannerImage?.url || data.bannerImageMobile?.url;
  const bannerImageMobile = data.bannerImageMobile?.url || data.bannerImage?.url;

const contentCards = (data.design9Cards || []).filter(
      (card) =>
        isFilledText(card?.heading) ||
        isFilledText(card?.description) ||
        (Array.isArray(card?.images) && card.images.some((img) => img?.url)),
    );

    return (
      <div className="min-h-screen bg-background font-body text-heading">
        {(bannerImageMobile || bannerImageDesktop) && (
          <div className="relative h-[250px] md:h-[600px] w-full md:h-[500px]">
            {bannerImageMobile ? (
              <div
                className="absolute inset-0 bg-contain bg-no-repeat bg-center md:hidden"
                style={{ backgroundImage: `url(${bannerImageMobile})` }}
              />
            ) : null}
            {bannerImageDesktop ? (
              <div
                className="absolute inset-0 hidden bg-cover bg-center md:block"
                style={{ backgroundImage: `url(${bannerImageDesktop})` }}
              />
            ) : null}
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 bg-background">
          {(isFilledText(data.design9MiniHeading) ||
            isFilledText(data.design9MainHeading) ||
            isFilledText(data.design9Description)) && (
            <section className="grid gap-2 lg:grid-cols-2 lg:items-start lg:gap-16">
              <div>
                {isFilledText(data.design9MiniHeading) && (
                  <p className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {data.design9MiniHeading}
                  </p>
                )}
                {isFilledText(data.design9MainHeading) && (
                  <h1 className="mt-3 font-heading text-4xl leading-tight text-heading md:text-5xl">
                    {data.design9MainHeading}
                  </h1>
                )}
              </div>
              {isFilledText(data.design9Description) && (
                <HtmlBlock
                  html={data.design9Description}
                  className="font-body text-muted [&_p]:text-base [&_p]:leading-8"
                />
              )}
            </section>
          )}

          {contentCards.length > 0 && (
            <div className="mt-20 space-y-20 bg-background">
              {contentCards.map((card, idx) => {
                const reverse = idx % 2 === 1;
                return (
                  <section
                    key={`${card.heading}-${idx}`}
                    className="grid items-center gap-5 lg:grid-cols-2 lg:gap-16"
                  >
                    <div className={reverse ? "lg:order-2" : undefined}>
                      {isFilledText(card.heading) && (
                        <h2 className="font-heading text-3xl text-heading">
                          {card.heading}
                        </h2>
                      )}
                      {isFilledText(card.description) && (
                        <HtmlBlock
                          html={card.description}
                          className="mt-4 font-body text-muted [&_p]:text-base [&_p]:leading-8"
                        />
                      )}
                    </div>
                    <div className={reverse ? "lg:order-1" : undefined}>
                      <ImageDotsCarousel
                        images={card.images}
                        alt={card.heading || data.title || "Section image"}
                      />
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  
}
