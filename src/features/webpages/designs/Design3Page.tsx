"use client";

import { useMemo } from "react";
import { Quote } from "lucide-react";
import {
  ShareCard,
  cleanObjectArray,
  cleanTextArray,
  formatDate,
  isFilledText,
} from "@/features/webpages/webpage-shared";
import { HtmlBlock } from "@/features/webpages/utils/html-block";
import type { StorefrontWebpage } from "@/features/webpages/webpage.types";
import Image from "next/image";

type ParagraphSection = StorefrontWebpage["paragraphSections"][number];

function filledUrls(
  urls: Array<string | null | undefined>,
): string[] {
  return urls.filter((url): url is string => Boolean(url));
}

export function Design3Page({ data }: { data: StorefrontWebpage }) {
  const tags = useMemo(
    () => cleanTextArray(data.createTags),
    [data.createTags],
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
  const blockquoteTags = useMemo(
    () => cleanTextArray(data.blockquoteTags),
    [data.blockquoteTags],
  );

  const paragraphImages = filledUrls([
    data.paragraphFirstImage?.url,
    data.paragraphSecondImage?.url,
  ]);
  const getSectionImages = (section: ParagraphSection) => {
    const sectionImages = filledUrls([
      section.firstImage?.url,
      section.secondImage?.url,
    ]);
    return sectionImages.length > 0 ? sectionImages : paragraphImages;
  };

  const heroFallbacks = filledUrls([
    data.imageFirst?.url,
    data.mainProfileImage?.url,
    data.bannerImage?.url,
    ...(data.imageGallery || []).map((item) => item?.url),
  ]).slice(0, 3);
  const mobileHeroSrc =
    data.imageFirstMobile?.url || data.imageFirst?.url || heroFallbacks[0];
  const desktopHeroSrc = data.imageFirst?.url || heroFallbacks[0];
  const introHighlight = highlights[0] ?? null;
  const remainingHighlights = highlights.slice(1);

  return (
    <div className="min-h-screen bg-background font-semibold text-gray-900">
      <div className="w-full border-b border-gray-900 bg-background">
        <div className="w-full">
          <div className="grid grid-cols-1 gap-2">
            <div className="overflow-hidden">
              {mobileHeroSrc ? (
                <Image
                  width={800}
                  height={500}
                  src={mobileHeroSrc}
                  alt={data.title}
                  className="h-[500px] w-full object-contain md:hidden"
                />
              ) : null}
              {desktopHeroSrc ? (
                <Image
                  width={1920}
                  height={600}
                  src={desktopHeroSrc}
                  alt={data.title}
                  className="hidden h-[550px] w-full object-cover md:block"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto w-full px-4 py-2 sm:px-6 md:max-w-7xl lg:px-8">
        <div className="bg-background">
          <section className="grid gap-6 py-4 sm:px-8 md:px-5 md:py-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                {data.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>
                  {data.postedBy?.admin
                    ? "By Admin"
                    : data.sideThumbName || "By Admin"}
                </span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span>
                  {formatDate(data.updatedAt || data.createdAt) || ""}
                </span>
              </div>
              {tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={tag + idx}
                      className="rounded-full border border-[#e3dbe8] bg-[#faf7ff] px-3 py-1 text-xs font-semibold text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="lg:justify-self-end">
              <ShareCard slug={data.slug} />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-10 bg-background sm:px-8 md:p-5">
            <main className="space-y-10">
              {paragraphs.length > 0 &&
                paragraphs.map((section, index) => {
                  const sectionImages = getSectionImages(section);
                  return (
                    <section
                      key={`${section.title}-${index}`}
                      className="space-y-3"
                    >
                      {isFilledText(section.title) && (
                        <h2 className="text-2xl font-bold leading-tight text-gray-950">
                          {section.title}
                        </h2>
                      )}
                      <HtmlBlock
                        html={section.description}
                        className="text-sm"
                      />
                      {sectionImages.length > 0 && (
                        <div
                          className={`grid gap-4 ${sectionImages.length > 1 ? "grid-cols-1 sm:grid-cols-[2fr_1fr]" : "grid-cols-1"}`}
                        >
                          {sectionImages.map((image, imgIndex) => (
                            <div
                              key={`${image}-${imgIndex}`}
                              className="mt-2 h-[280px] overflow-hidden rounded-image sm:h-[320px] md:h-[350px] group"
                            >
                              <Image
                                width={1200}
                                height={800}
                                src={image}
                                alt={
                                  section.title ||
                                  `Section image ${imgIndex + 1}`
                                }
                                className="h-full w-full object-contain hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      {section.bulletPoints &&
                        section.bulletPoints.length > 0 &&
                        section.bulletPoints.some((point) =>
                          isFilledText(point),
                        ) && (
                          <div className="space-y-3 py-3">
                            {section.bulletPoints.map(
                              (point, bulletIdx) =>
                                isFilledText(point) && (
                                  <div key={bulletIdx} className="flex gap-3">
                                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#6156b0]" />
                                    <p className="text-md leading-6 text-gray-600">
                                      {point}
                                    </p>
                                  </div>
                                ),
                            )}
                          </div>
                        )}
                    </section>
                  );
                })}

              {tableRows.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-950">
                    {data.tableTitle || "Table Information"}
                  </h2>
                  <div className="overflow-hidden rounded-lg border border-border bg-surface">
                    <table className="w-full text-left text-sm">
                      <tbody>
                        {tableRows.map((row, index) => (
                          <tr
                            key={`${row.column1}-${row.column2}-${index}`}
                            className={`border transition-colors ${index % 2 === 0 ? "bg-background" : "bg-surface"} hover:bg-background`}
                          >
                            <td className="w-1/2 border-r border-border px-4 py-3 font-semibold text-heading">
                              {row.column1 || "-"}
                            </td>
                            <td className="w-1/2 px-4 py-3 text-foreground">
                              {isFilledText(row.column2) ? (
                                <HtmlBlock
                                  html={row.column2}
                                  className="text-sm"
                                />
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {(isFilledText(data.blockquoteDescription) ||
                isFilledText(data.blockquoteMainTitle)) && (
                <section className="flex flex-col gap-2 rounded px-2 py-5 text-black">
                  <div className="rounded-[24px] border border-gray-800 bg-[linear-gradient(135deg,#fcfaf6,#f7f4ec,#e8efe0)] px-6 py-7 text-heading shadow-[0_20px_50px_rgba(120,135,79,0.12)]">
                    <Quote className="h-7 w-7 text-primary" />
                    {isFilledText(data.blockquoteMainTitle) && (
                      <h2 className="mt-3 mb-2 text-2xl leading-tight font-bold text-heading">
                        {data.blockquoteMainTitle}
                      </h2>
                    )}
                    {isFilledText(data.blockquoteLeftTitle) && (
                      <span className="text-black">
                        {data.blockquoteLeftTitle}
                      </span>
                    )}
                  </div>
                  <div className="px-1">
                    <div className="my-4 text-black">
                      <HtmlBlock
                        html={data.blockquoteDescription}
                        className="text-black"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {blockquoteTags.map((tag) => (
                        <span
                          key={tag}
                          className="w-fit rounded-md border border-gray-500 px-3 py-2 text-[12px] text-black"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {remainingHighlights.length > 0 && (
                <section className="space-y-5">
                  {introHighlight && (
                    <div className="rounded-md border border-[#e6dccf] bg-[#f4ede3] px-5 py-6 shadow-sm">
                      {isFilledText(introHighlight.title) && (
                        <h2 className="text-2xl font-bold leading-tight text-gray-950">
                          {introHighlight.title}
                        </h2>
                      )}
                      {isFilledText(introHighlight.point) && (
                        <p className="mt-3 text-justify text-base leading-7 text-gray-600">
                          {introHighlight.point}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col gap-4">
                    {remainingHighlights.map((item, index) => (
                      <div
                        key={`${item.title}-${index}`}
                        className="rounded-md border border-gray-200 bg-white px-5 py-5 shadow-sm"
                      >
                        {isFilledText(item.title) && (
                          <h3 className="text-2xl font-bold leading-tight text-gray-950">
                            {item.title}
                          </h3>
                        )}
                        {isFilledText(item.point) && (
                          <p className="mt-2 text-justify text-base leading-7 text-gray-600">
                            {item.point}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
