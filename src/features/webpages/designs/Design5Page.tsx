"use client";

import Image from "next/image";
import {
  isFilledText,
} from "@/features/webpages/webpage-shared";
import type { StorefrontWebpage } from "@/features/webpages/webpage.types";
import { ArrowUpRightIcon } from "lucide-react";



export function Design5Page({ data }: { data: StorefrontWebpage }) {
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
return (
      <div className="min-h-screen bg-background font-semibold text-gray-900">
        {/* Top Banner */}
        <div className="relative h-[450px] md:h-[550px] w-full flex items-end pb-10 pl-6 md:pl-20">
          {designHeaderMobile ? (
            <div
              className="absolute inset-0 bg-contain bg-no-repeat bg-center md:hidden"
              style={{ backgroundImage: `url(${designHeaderMobile})` }}
            />
          ) : null}
          {designHeaderDesktop ? (
            <div
              className="absolute inset-0 hidden bg-cover bg-center md:block"
              style={{ backgroundImage: `url(${designHeaderDesktop})` }}
            />
          ) : null}
          <div className="relative z-10 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
              {data.secondTitle || ""}
            </h1>
            <p className="text-md text-white md:text-lg font-semibold">
              {data.firstTitle || ""}
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mx-auto max-w-7xl md:py-16 py-8 px-5 sm:px-6 lg:px-8">
          {/* Top Text Section */}
          <div className="mb-12 max-w-3xl">
            {isFilledText(data.design5Chip) && (
              <div className="inline-block border border-gray-400 rounded-full px-4 py-1 text-sm font-medium text-gray-600 mb-2">
                {data.design5Chip}
              </div>
            )}

            {isFilledText(data.design5MainHeading) && (
              <h2 className="text-2xl md:text-4xl font-serif text-gray-800 leading-snug">
                {data.design5MainHeading}
              </h2>
            )}
          </div>

          {/* Grid Cards Section */}
          {data.gridCards?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {data.gridCards.map((card, idx) => (
                <div key={idx} className="group flex flex-col cursor-pointer">
                  <div className="relative mb-6 h-64 w-full rounded-md overflow-hidden md:h-80">
                    {card.image?.url ? (
                      <Image
                        src={card.image.url}
                        alt={card.title || "Card image"}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) :null}
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      {isFilledText(card.chipName) && (
                        <div className="inline-block border border-gray-400 rounded-full px-3 py-0.5 text-xs font-medium text-gray-600">
                          {card.chipName}
                        </div>
                      )}

                      {isFilledText(card.link) && (
                        <a
                          href={card.link}
                          className="ml-auto flex shrink-0 items-center gap-1 text-sx font-semibold px-5 py-2 bg-primary text-white rounded-md"
                        >
                          Explore More
                          <ArrowUpRightIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                      {card.title}
                    </h3>
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
