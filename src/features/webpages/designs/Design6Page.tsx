"use client";

import {
  Phone,
} from "lucide-react";
import {
  AuthorCard,
  Facebook,
  GetInTouchCard,
  HtmlBlock,
  ImageDotsCarousel,
  Instagram,
  ShareCard,
  StaticSidebarCard,
  Youtube,
  cleanObjectArray,
  cleanTextArray,
  formatDate,
  isFilledText,
} from "@/features/webpages/webpage-shared";
import type { StorefrontWebpage } from "@/features/webpages/webpage.types";
import Image from "next/image";


export function Design6Page({ data }: { data: StorefrontWebpage }) {
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
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="relative z-10 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
              {data.firstTitle || ""}
            </h1>
            <p className="text-md md:text-lg font-semibold text-white">
              {data.secondTitle || ""}
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Top Section */}
          <div className="mb-12 max-w-7xl">
            <div className="flex justify-between items-start mb-6">
              {isFilledText(data.design6Chip) && (
                <div className="inline-block border border-gray-400 rounded-full px-4 py-1 text-sm font-medium text-gray-600">
                  {data.design6Chip}
                </div>
              )}
              {isFilledText(data.design6ExploreLink) && (
                <a
                  href={data.design6ExploreLink}
                  className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-black border border-gray-200 px-4 py-1 rounded-md"
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

            {isFilledText(data.design6MainHeading) && (
              <h2 className="text-3xl md:text-4xl font-serif text-gray-800 leading-tight mb-6">
                {data.design6MainHeading}
              </h2>
            )}

            {isFilledText(data.design6SubHeading) && (
              <p className="text-gray-800 text-sm md:text-lg leading-relaxed mb-8 w-full text-justify">
                {data.design6SubHeading}
              </p>
            )}

            {isFilledText(data.design6Author) && (
              <p className="text-sm font-medium text-gray-800">
                {data.design6Author}
              </p>
            )}
          </div>

          <hr className="my-10 border-gray-300" />

          {/* Mid Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            {isFilledText(data.design6MidHeading) && (
              <h2 className="text-2xl md:text-4xl font-serif text-gray-800 leading-snug max-w-2xl">
                {data.design6MidHeading}
              </h2>
            )}
          </div>

          {/* Team members */}
          {/* Team members */}
          <div className="flex flex-col gap-10">
            {(data.teamCards || []).map((card, idx) => (
              <div
                key={idx}
                className={`mx-auto flex w-full max-w-7xl flex-col gap-5 md:flex-row md:gap-6 border border-border rounded-2xl p-5 md:p-6 ${
                  idx % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Image */}
                <div className="overflow-hidden rounded-2xl bg-gray-100 md:w-[42%]">
                  {card.image?.url ? (
                    <Image
                      src={card.image.url}
                      quality={90}
                      width={500}
                      height={400}
                      alt={card.name || "Team member"}
                      className="h-[320px] w-full object-cover md:h-[500px]"
                    />
                  ) : (
                    <div className="flex h-[320px] items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col md:w-[58%]">
                  <div className="flex-1 rounded-2xl bg-gray-100 border border-gray-200 p-5 md:p-6">
                    {isFilledText(card.name) && (
                      <h3 className="text-xl font-bold text-gray-900 md:text-3xl">
                        {card.name}
                      </h3>
                    )}

                    {isFilledText(card.designation) && (
                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {card.designation}
                      </p>
                    )}

                    {isFilledText(card.qualification) && (
                      <p className="mt-4 text-md leading-relaxed text-justify text-gray-700">
                        <span className="font-bold text-gray-900">
                          Qualification:{" "}
                        </span>
                        {card.qualification}
                      </p>
                    )}

                    {isFilledText(card.specialization) && (
                      <p className="mt-3 text-md leading-relaxed text-justify text-gray-700">
                        <span className="font-bold text-gray-900">
                          Specialization:{" "}
                        </span>
                        {card.specialization}
                      </p>
                    )}
                  </div>

                  {/* Bottom info */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />

                      {isFilledText(card.phone) && (
                        <a
                          href={`tel:${card.phone?.replace(/[^0-9+]/g, "")}`}
                          className="text-md font-medium text-gray-700 hover:text-gray-900"
                        >
                          {card.phone}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isFilledText(card.facebook) && (
                        <a
                          href={card.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}

                      {isFilledText(card.instagram) && (
                        <a
                          href={card.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}

                      {isFilledText(card.youtube) && (
                        <a
                          href={card.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Youtube className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* <PopularDestinations /> */}
      </div>
    );
  
}
