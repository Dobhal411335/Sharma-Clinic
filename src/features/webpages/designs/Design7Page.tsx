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



export function Design7Page({ data }: { data: StorefrontWebpage }) {
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

return (
      <div className="min-h-screen bg-background font-geist text-gray-900">
        {/* Top Banner */}
        <div className="relative h-[500px] md:h-[600px] w-full flex items-end pb-10 pl-6 md:pl-20">
          {designHeaderMobile ? (
            <div
              className="absolute inset-0 bg-contain bg-no-repeat bg-center md:hidden"
              style={{ backgroundImage: `url(${designHeaderMobile})` }}
            />
          ) : null}
          {designHeaderDesktop ? (
            <div
              className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
              style={{ backgroundImage: `url(${designHeaderDesktop})` }}
            />
          ) : null}
          {/* <div className="absolute inset-0 bg-black/40"></div> */}
          <div className="relative z-10 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
              {data.secondTitle || ""}
            </h1>
            <p className="text-md md:text-lg font-semibold text-white">
              {data.firstTitle || ""}
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Top Section */}
          <div className="mb-12 max-w-7xl">
            <div className="flex justify-between items-start mb-6">
              {isFilledText(data.design7Chip) && (
                <div className="inline-block border border-gray-400 rounded-full px-4 py-1 text-sm font-medium text-gray-600">
                  {data.design7Chip}
                </div>
              )}
              {isFilledText(data.design7ExploreLink) && (
                <a
                  href={data.design7ExploreLink}
                  className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-black border border-gray-900 px-6 py-2 rounded-md"
                >
                  Explore Area
                  <svg
                    className="w-4 h-4 ml-1 transform -rotate-45"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              )}
            </div>

            {isFilledText(data.design7MainHeading) && (
              <h2 className="text-3xl md:text-5xl font-serif text-gray-800 leading-tight mb-6 max-w-3xl">
                {data.design7MainHeading}
              </h2>
            )}

            <hr className="my-10 border-gray-300" />
          </div>

          {/* Gallery Grid */}
          {data.gridCards?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.gridCards.map((card, idx) => (
                <div
                  key={idx}
                  className="relative group overflow-hidden bg-gray-100 aspect-3/4"
                >
                  {card.image?.url ? (
                    <img
                      src={card.image.url}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* Hover Overlay Box */}
                  <div className="absolute bottom-0 left-0 w-[90%] bg-white p-5 transform translate-y-full transition-transform duration-500 ease-in-out group-hover:translate-y-0 shadow-lg">
                    {isFilledText(card.chipName) && (
                      <div className="inline-block border border-gray-400 rounded px-3 py-0.5 text-xs font-medium text-gray-600 mb-2">
                        {card.chipName}
                      </div>
                    )}
                    {isFilledText(card.title) && (
                      <a
                        href={
                          card.gallerySlug
                            ? `/gallery/${card.gallerySlug}`
                            : "#"
                        }
                        className="block text-lg font-serif text-[#3b438c] hover:text-black"
                      >
                        {card.title}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* <PopularDestinations /> */}
      </div>
    );
  
}
