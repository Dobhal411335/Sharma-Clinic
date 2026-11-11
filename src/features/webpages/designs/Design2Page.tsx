"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Quote } from "lucide-react";
import {
  AuthorCard,
  GetInTouchCard,
  ShareCard,
  StaticSidebarCard,
  cleanObjectArray,
  cleanTextArray,
  isFilledText,
} from "@/features/webpages/webpage-shared";
import { HtmlBlock } from "@/features/webpages/utils/html-block";
import type { StorefrontWebpage } from "@/features/webpages/webpage.types";
import Image from "next/image";

export function Design2Page({ data }: { data: StorefrontWebpage }) {
  const [openAccordion, setOpenAccordion] = useState(0);

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
  const accordionItems = useMemo(
    () => cleanObjectArray(data.accordionTags, ["left", "right"]),
    [data.accordionTags],
  );
  const blockquoteTags = useMemo(
    () => cleanTextArray(data.blockquoteTags),
    [data.blockquoteTags],
  );

  const paragraphImages = [
    data.paragraphFirstImage?.url,
    data.paragraphSecondImage?.url,
  ].filter((url): url is string => Boolean(url));
  const getSectionImages = (section: {
    firstImage?: { url?: string } | null;
    secondImage?: { url?: string } | null;
  }) => {
    const sectionImages = [
      section?.firstImage?.url,
      section?.secondImage?.url,
    ].filter((url): url is string => Boolean(url));
    return sectionImages.length > 0 ? sectionImages : paragraphImages;
  };

  const hasTopMetaContent =
    isFilledText(data.firstTitle) ||
    isFilledText(data.secondTitle) ||
    tags.length > 0;
  const hasMainTopImage = !!data.imageFirst?.url || !!data.imageFirstMobile?.url;
  const hasTopHeaderContent = hasTopMetaContent || hasMainTopImage;
  const isBannerOnlyTop =
    (!!data.bannerImage?.url || !!data.bannerImageMobile?.url) &&
    !hasTopHeaderContent;
  const headerImage = data.imageFirst?.url || paragraphImages[0];
  const headerImageMobile =
    data.imageFirstMobile?.url ||
    data.imageFirst?.url ||
    paragraphImages[0];
  const bannerImageDesktop = data.bannerImage?.url || data.bannerImageMobile?.url;
  const bannerImageMobile =
    data.bannerImageMobile?.url || data.bannerImage?.url;

  const leadParagraph = paragraphs[0] ?? null;
  const contentParagraphs = paragraphs.slice(1);
  const leadParagraphImages = leadParagraph
    ? getSectionImages(leadParagraph)
    : paragraphImages;

  return (
    <div className="min-h-screen bg-background font-geist font-semibold text-gray-900">
      <div className="w-full border-b border-gray-900 bg-background">
        <div
          className={`w-full ${!isBannerOnlyTop ? "" : ""}`}
        >
          <div
            className={`grid gap-2 ${isBannerOnlyTop ? "grid-cols-1" : "w-full lg:items-center"}`}
          >
            {isBannerOnlyTop ? (
              <div className="overflow-hidden">
                {bannerImageMobile ? (
                  <Image
                    width={800}
                    height={1000}
                    src={bannerImageMobile}
                    alt={data.title}
                    className="h-[500px] w-full object-cover md:hidden"
                  />
                ) : null}
                {bannerImageDesktop ? (
                  <Image
                    width={1920}
                    height={800}
                    src={bannerImageDesktop}
                    alt={data.title}
                    className="hidden h-[600px] w-full object-cover md:block"
                  />
                ) : null}
              </div>
            ) : (
              <div className="overflow-hidden">
                {headerImageMobile ? (
                  <Image
                    width={800}
                    height={600}
                    src={headerImageMobile}
                    alt={data.title}
                    className="h-[500px] w-full object-contain md:hidden"
                  />
                ) : null}
                {headerImage ? (
                  <Image
                    width={1200}
                    height={800}
                    src={headerImage}
                    alt={data.title}
                    className="hidden h-[550px] w-full object-cover md:block"
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto w-full px-4 py-2 sm:px-6 md:max-w-7xl lg:px-8">
        <div className="bg-background">
          {leadParagraph && (
            <section className="space-y-5 px-0 py-4 sm:px-8 md:px-5 md:py-4">
              {isFilledText(leadParagraph.title) && (
                <h2 className="text-3xl font-bold leading-tight text-gray-950">
                  {leadParagraph.title}
                </h2>
              )}
              <HtmlBlock html={leadParagraph.description} />
              {leadParagraphImages.length > 0 && (
                <div className="space-y-4">
                  <div
                    className={`grid gap-4 ${leadParagraphImages.length > 1 ? "sm:grid-cols-[2fr_1fr]" : "grid-cols-1"}`}
                  >
                    {leadParagraphImages.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="overflow-hidden rounded-md bg-[#f8f5ef]"
                      >
                        <Image
                          src={image}
                          alt={leadParagraph.title || `Lead image ${index + 1}`}
                          width={1200}
                          height={700}
                          className="h-auto w-full object-cover sm:h-[200px] md:h-[350px]"
                        />
                      </div>
                    ))}
                  </div>
                  {leadParagraph.bulletPoints &&
                    leadParagraph.bulletPoints.length > 0 &&
                    leadParagraph.bulletPoints.some((point) =>
                      isFilledText(point),
                    ) && (
                      <div className="mt-4 space-y-3">
                        {leadParagraph.bulletPoints.map(
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
                </div>
              )}
            </section>
          )}

          <div className="grid gap-10 bg-background sm:px-8 md:p-5 lg:grid-cols-[400px_1fr]">
            <aside className="space-y-5 bg-background lg:sticky lg:top-20">
              <AuthorCard data={data} />
              <StaticSidebarCard data={data} />
              <GetInTouchCard pageTitle={data.title || data.firstTitle || ""} />
              <ShareCard slug={data.slug} />
            </aside>

            <main className="space-y-10 bg-background">
              {contentParagraphs.length > 0 &&
                contentParagraphs.map((section, index) => {
                  const sectionImages = getSectionImages(section);
                  return (
                    <section
                      key={`${section.title}-${index}`}
                      className="space-y-5"
                    >
                      {isFilledText(section.title) && (
                        <h2 className="text-3xl font-bold leading-tight text-gray-950">
                          {section.title}
                        </h2>
                      )}
                      <HtmlBlock html={section.description} />
                      {sectionImages.length > 0 && (
                        <div
                          className={`grid gap-4 ${sectionImages.length > 1 ? "sm:grid-cols-[2fr_1fr]" : "grid-cols-1"}`}
                        >
                          {sectionImages.map((image, imageIndex) => (
                            <div
                              key={`${image}-${imageIndex}`}
                              className="overflow-hidden rounded-md bg-[#f8f5ef]"
                            >
                              <Image
                                width={1200}
                                height={800}
                                src={image}
                                alt={
                                  section.title ||
                                  `Section image ${imageIndex + 1}`
                                }
                                className="w-full object-cover sm:h-[200px] md:h-[250px]"
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
                          <div className="mt-4 space-y-3">
                            {section.bulletPoints.map(
                              (point, bulletIdx) =>
                                isFilledText(point) && (
                                  <div key={bulletIdx} className="flex gap-3">
                                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#6156b0]" />
                                    <p className="text-sm leading-6 text-gray-600">
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
                  <h2 className="text-2xl font-bold text-gray-950">
                    {data.tableTitle || "Table Information"}
                  </h2>
                  <div className="overflow-hidden border-[#ddd5ca] bg-white">
                    <table className="w-full text-left text-sm">
                      <tbody>
                        {tableRows.map((row, index) => (
                          <tr
                            key={`${row.column1}-${row.column2}-${index}`}
                            className={`border border-gray-800 ${index % 2 === 0 ? "bg-surface" : "bg-background"}`}
                          >
                            <td className="w-1/2 border-r border-b border-gray-400 px-4 py-3 font-medium text-black">
                              {row.column1 || "-"}
                            </td>
                            <td className="w-1/2 border-b border-gray-400 px-4 py-3 font-medium text-black">
                              {isFilledText(row.column2) ? (
                                <HtmlBlock
                                  html={row.column2}
                                  className="text-sm font-medium"
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
                  <div className="rounded-[24px] border border-gray-700 bg-[linear-gradient(135deg,#fcfaf6,#f7f4ec,#e8efe0)] px-6 py-7 text-heading shadow-[0_20px_50px_rgba(120,135,79,0.12)]">
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

              {highlights.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-950">
                    More details
                  </h2>
                  <div className="grid gap-4 md:grid-cols-1">
                    {highlights.map((item, index) => (
                      <div
                        key={`${item.title}-${index}`}
                        className="rounded-md border border-gray-800 bg-[#fcfaf6] p-5"
                      >
                        {isFilledText(item.title) && (
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.title}
                          </h3>
                        )}
                        {isFilledText(item.point) && (
                          <p className="mt-2 text-sm leading-7 text-gray-600">
                            {item.point}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {accordionItems.length > 0 && (
                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-950">
                    Special Note
                  </h2>
                  <div className="space-y-2.5">
                    {accordionItems.map((item, index) => {
                      const isOpen = openAccordion === index;
                      return (
                        <div
                          key={`${item.left}-${index}`}
                          className={`overflow-hidden rounded-lg border transition-all duration-300 ${isOpen ? "border-[#060606] bg-linear-to-br from-bg-background to-bg-background" : "border-[#e6dccf] bg-white"}`}
                          style={{
                            transformOrigin: "top",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenAccordion(isOpen ? -1 : index)
                            }
                            className={`flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-all duration-300 ${isOpen ? "bg-linear-to-r from-bg-background to-bg-background" : "hover:bg-bg-background"}`}
                          >
                            <span
                              className={`font-semibold transition-colors duration-300 ${isOpen ? "text-black" : "text-black group-hover:text-black"}`}
                            >
                              {item.left || `Question ${index + 1}`}
                            </span>
                            <ChevronDown
                              className={`h-5 w-5 shrink-0 transition-all duration-500 ${isOpen ? "rotate-180 text-black" : "text-black"}`}
                            />
                          </button>
                          <div
                            className={`grid transition-all duration-500 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                          >
                            <div className="overflow-hidden">
                              <div className="border-t border-[#e6dccf] px-6 py-5 text-sm leading-7 text-gray-700">
                                {item.right || "No details added yet."}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
