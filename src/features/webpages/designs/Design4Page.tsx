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
import Image from "next/image";



export function Design4Page({ data }: { data: StorefrontWebpage }) {
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
  const blockquoteTags = useMemo(
    () => cleanTextArray(data.blockquoteTags),
    [data.blockquoteTags],
  );
  const paragraphs = useMemo(
    () => cleanObjectArray(data.paragraphSections, ["title", "description"]),
    [data.paragraphSections],
  );
  const tableRows = useMemo(
    () => cleanObjectArray(data.tableRows, ["column1", "column2"]),
    [data.tableRows],
  );
  const highlights = useMemo(
    () => cleanObjectArray(data.highlights, ["title", "point"]),
    [data.highlights],
  );
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
              className="absolute inset-0 hidden bg-cover bg-center md:block"
              style={{ backgroundImage: `url(${designHeaderDesktop})` }}
            />
          ) : null}
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="relative z-10 text-white">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {data.firstTitle || ""}
            </h1>
            <p className="text-md md:text-lg font-semibold text-white">
              {data.secondTitle || ""}
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          {/* Left Column */}
          <div className="space-y-8 border-r border-gray-900 px-5">
            {/* Blockquote Tags */}
            {blockquoteTags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {blockquoteTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-white text-gray-700 text-[12px] font-semibold px-5 py-2 rounded-full border border-gray-200 shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Heading & Paragraph (Mapped for all paragraphs) */}
            {paragraphs.map((para, paraIdx) => {
              const paraImages = [
                para?.firstImage?.url,
                para?.secondImage?.url,
              ].filter(Boolean);

              return (
                <section
                  key={paraIdx}
                  className="mb-10 rounded-xl border border-gray-600 bg-background p-6 md:p-8 shadow-sm"
                >
                  {/* Heading */}
                  {isFilledText(para.title) && (
                    <h2 className="mb-5 text-2xl font-bold text-gray-900 md:text-3xl">
                      {para.title}
                    </h2>
                  )}

                  {/* Description */}
                  <div className="max-w-5xl text-justify">
                    <HtmlBlock
                      html={para.description}
                    />
                  </div>

                  {/* Images */}
                  {paraImages.length > 0 && (
                    <div
                      className={`mt-8 grid gap-5 ${
                        paraImages.length > 1 ? "grid-cols-2" : "grid-cols-1"
                      }`}
                    >
                      {paraImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`overflow-hidden rounded-xl shadow-md ${
                            paraImages.length > 1
                              ? "aspect-square"
                              : "h-[280px] sm:h-[320px] md:h-[360px]"
                          }`}
                        >
                          <Image
                            width={1200}
                            height={800}
                            src={imgUrl}
                            alt={`${para.title || "Paragraph"} ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bullet Points */}
                  {para.bulletPoints?.length > 0 && (
                    <div className="mt-8">
                      <ul className="space-y-4">
                        {para.bulletPoints.map(
                          (point, idx) =>
                            isFilledText(point) && (
                              <li
                                key={idx}
                                className="flex items-start gap-4 rounded-lg bg-gray-50 border p-4"
                              >
                                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />

                                <span
                                  className="leading-7 text-gray-700"
                                  dangerouslySetInnerHTML={{ __html: point }}
                                />
                              </li>
                            ),
                        )}
                      </ul>
                    </div>
                  )}
                </section>
              );
            })}

            {/* Highlights Section */}
            {highlights?.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">
                  Highlights
                </h2>

                <div className="grid gap-5 md:grid-cols-2">
                  {highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border-l-4 border-blue-600 border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                    >
                      {isFilledText(item.title) && (
                        <h3 className="mb-3 text-lg font-bold text-gray-900">
                          {item.title}
                        </h3>
                      )}

                      {isFilledText(item.point) && (
                        <p className="leading-7 text-gray-600">{item.point}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notices */}
            {data.notices?.length > 0 && (
              <div className="my-10">
                <h2 className="mb-5 text-2xl font-bold text-gray-900">
                  Important Notices
                </h2>

                <div className="space-y-4">
                  {data.notices.map((notice, idx) => {
                    const getNoticeStyles = (type) => {
                      switch (type) {
                        case "warning":
                          return {
                            container: "bg-yellow-50 border-yellow-300",
                            text: "text-yellow-800",
                          };
                        case "info":
                          return {
                            container: "bg-blue-50 border-blue-300",
                            text: "text-blue-800",
                          };
                        case "danger":
                          return {
                            container: "bg-red-50 border-red-300",
                            text: "text-red-800",
                          };
                        case "success":
                          return {
                            container: "bg-green-50 border-green-300",
                            text: "text-green-800",
                          };
                        default:
                          return {
                            container: "bg-yellow-50 border-yellow-300",
                            text: "text-yellow-800",
                          };
                      }
                    };

                    const styles = getNoticeStyles(notice.type);

                    return (
                      <div
                        key={idx}
                        className={`rounded-lg border p-4 ${styles.container}`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle
                            className={`mt-0.5 h-5 w-5 shrink-0 ${styles.text}`}
                          />

                          <div className={`text-md ${styles.text}`}>
                            {notice.title && (
                              <h4 className="mb-1 font-semibold">
                                {notice.title}
                              </h4>
                            )}

                            <p className="leading-6">{notice.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quote Block */}
            {(isFilledText(data.blockquoteDescription) ||
              isFilledText(data.blockquoteLeftTitle) ||
              isFilledText(data.blockquoteMainTitle)) && (
              <div className="relative my-12 rounded-xl border border-gray-100 bg-[#dbe7bc] p-8 md:p-10 shadow-sm">
                {/* Overlapping top-left quote bubble */}
                <div className="absolute -top-5 left-6 md:left-8 flex h-10 w-10 items-center justify-center rounded-full bg-[#1e40af] text-white shadow-md">
                  <Quote className="h-5 w-5 fill-current" />
                </div>

                <div className="flex flex-col items-start text-left mt-2">
                  {isFilledText(data.blockquoteMainTitle) && (
                    <h3 className="mb-4 text-xl font-bold text-gray-900">
                      {data.blockquoteMainTitle}
                    </h3>
                  )}

                  <div className="max-w-4xl text-lg leading-relaxed text-gray-700 font-medium prose prose-gray">
                    <HtmlBlock html={data.blockquoteDescription} />
                  </div>

                  {isFilledText(data.blockquoteLeftTitle) && (
                    <div className="mt-6 flex items-center gap-3 text-sm font-bold text-gray-800">
                      <span className="h-[2px] w-8 bg-[#1e40af]/60" />
                      <span>{data.blockquoteLeftTitle}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bold Paragraph */}
            {isFilledText(data.tableTitle) && (
              <div className="mt-10 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {data.tableTitle}
                </h2>

                <div className="mt-2 h-1 w-20 rounded bg-blue-600" />
              </div>
            )}

            <div className="mt-8 overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background">
                    <th className="border-r border-border px-6 py-4 text-left text-sm font-bold uppercase tracking-wide text-heading">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide text-heading">
                      Details
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tableRows.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-t border-border transition-colors ${
                        index % 2 === 0 ? "bg-background" : "bg-surface"
                      } hover:bg-background`}
                    >
                      <td className="border-r border-border px-6 py-5 font-semibold text-heading">
                        {row.column1}
                      </td>

                      <td className="px-6 py-5 leading-7 text-foreground">
                        <HtmlBlock html={row.column2} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Advertisements */}
            {((data.advertisements && data.advertisements.length > 0) ||
              data.advertisementImage?.url) && (
              <div className="space-y-4">
                {(data.advertisements && data.advertisements.length > 0
                  ? data.advertisements
                  : [
                      {
                        image: data.advertisementImage,
                        url: data.advertisementUrl,
                      },
                    ]
                ).map(
                  (ad, idx) =>
                    ad.image?.url && (
                      <div
                        key={idx}
                        className="group overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
                      >
                        {ad.url ? (
                          <a
                            href={ad.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative overflow-hidden"
                          >
                            <img
                              src={ad.image.url}
                              alt={`Advertisement ${idx + 1}`}
                              className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </a>
                        ) : (
                          <img
                            src={ad.image.url}
                            alt={`Advertisement ${idx + 1}`}
                            className="w-full h-auto object-cover"
                          />
                        )}
                      </div>
                    ),
                )}
              </div>
            )}

            {/* Search Location Table */}
            {data.searchLocations?.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-4 text-xl font-bold text-gray-900">
                  Search Locations
                </h3>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_120px] bg-gray-100 border-b border-gray-300 px-5 py-3 text-sm font-bold uppercase tracking-wide text-gray-800">
                    <span className="text-sm">Location</span>
                    <span className="text-right text-sm">Total Count</span>
                  </div>

                  {/* Rows */}
                  {data.searchLocations.map((loc, idx) => (
                    <Link
                      key={idx}
                      href={loc?.url}
                      className="grid grid-cols-[1fr_120px] items-center border-b border-gray-200 px-5 py-4 transition-colors hover:bg-gray-50 last:border-b-0"
                    >
                      <span className="font-semibold text-sm text-gray-900">
                        {loc.locationName}
                      </span>

                      <span className="text-right font-bold text-sm text-gray-700">
                        {loc.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* <PopularDestinations /> */}
      </div>
    );
  
}
