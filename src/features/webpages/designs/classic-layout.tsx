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



type ClassicVariant = "design1" | "design2" | "design3";

/**
 * Hotel misnamed design1 as isDesignTwo. We map explicitly:
 * - design1 → Hotel's isDesignTwo layout (330px sidebar, lead paragraph)
 * - design2 → Hotel's opposite classic layout (400px sidebar)
 * - design3 → full-width / no sidebar accordion layout
 */
function ClassicWebpageLayout({
  data,
  variant,
}: {
  data: StorefrontWebpage;
  variant: ClassicVariant;
}) {
  console.log("data22", data)
  const [openAccordion, setOpenAccordion] = useState(0);
  const isDesignOne = variant === "design1";
  const isDesignTwo = variant === "design2";
  const isDesignThree = variant === "design3";

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
  ].filter(Boolean);
  const getSectionImages = (section) => {
    const sectionImages = [
      section?.firstImage?.url,
      section?.secondImage?.url,
    ].filter(Boolean);
    return sectionImages.length > 0 ? sectionImages : paragraphImages;
  };
  const hasTopMetaContent =
    isFilledText(data.firstTitle) ||
    isFilledText(data.secondTitle) ||
    tags.length > 0;
  const hasMainTopImage = !!data.imageFirst?.url || !!data.imageFirstMobile?.url;
  const hasTopHeaderContent = hasTopMetaContent || hasMainTopImage;
  const isBannerOnlyTop =
    !isDesignThree &&
    (!!data.bannerImage?.url || !!data.bannerImageMobile?.url) &&
    !hasTopHeaderContent;
  const headerImage =
    data.imageFirst?.url || paragraphImages[0];
  const headerImageMobile =
    data.imageFirstMobile?.url ||
    data.imageFirst?.url ||
    paragraphImages[0];
  const bannerImageDesktop = data.bannerImage?.url || data.bannerImageMobile?.url;
  const bannerImageMobile =
    data.bannerImageMobile?.url || data.bannerImage?.url;
  const designThreeHeroImages = [
    data.imageFirst?.url,
    data.mainProfileImage?.url,
    data.bannerImage?.url,
    ...(data.imageGallery || []).map((item) => item?.url).filter(Boolean),
  ]
    .filter(Boolean)
    .slice(0, 3);
  const introHighlight = isDesignThree ? highlights[0] : null;
  const remainingHighlights = isDesignThree ? highlights.slice(1) : highlights;

  // Hotel: isDesignTwo meant design1. Keep that visual for design1.
  const leadParagraph = isDesignOne ? paragraphs[0] : null;
  const contentParagraphs = isDesignOne ? paragraphs.slice(1) : paragraphs;
  const designOneLeadParagraph =
    isDesignTwo && !isDesignThree ? paragraphs[0] : null;
  const leadParagraphImages = leadParagraph
    ? getSectionImages(leadParagraph)
    : paragraphImages;
  const designOneLeadParagraphImages = designOneLeadParagraph
    ? getSectionImages(designOneLeadParagraph)
    : paragraphImages;
  const designOneRemainingParagraphs =
    isDesignTwo && !isDesignThree ? paragraphs.slice(1) : contentParagraphs;

  // Alias for JSX that still references Hotel's isDesignTwo (design1 layout)
  const hotelIsDesignTwo = isDesignOne;

  return (
    <div className="min-h-screen bg-background font-geist font-semibold text-gray-900">
      <div
        className={`w-full border-b border-gray-900 bg-background`}
      >
        <div
          className={`w-full ${!isDesignThree && !isDesignOne && !isBannerOnlyTop ? "md:px-4 sm:px-6" : ""
            }`}
        >
          <div
            className={`grid gap-2 ${isDesignThree || isDesignOne || isBannerOnlyTop ? "grid-cols-1" : "lg:grid-cols-[520px_minmax(0,1fr)] lg:items-center"}`}
          >
            {isDesignThree ? (
              <div className="overflow-hidden">
                {(data.imageFirstMobile?.url ||
                  data.imageFirst?.url ||
                  designThreeHeroImages[0]) && (
                    <>
                      <Image
                        width={800}
                        height={500}
                        src={
                          data.imageFirstMobile?.url ||
                          data.imageFirst?.url ||
                          designThreeHeroImages[0]
                        }
                        alt={data.title}
                        className="h-[240px] w-full object-cover md:hidden"
                      />
                      {(data.imageFirst?.url || designThreeHeroImages[0]) && (
                        <Image
                          width={1920}
                          height={600}
                          src={data.imageFirst?.url || designThreeHeroImages[0]}
                          alt={data.title}
                          className="hidden h-[350px] w-full object-cover md:block"
                        />
                      )}
                    </>
                  )}
              </div>
            ) : isBannerOnlyTop ? (
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
            ) : isDesignOne ? (
              <div className="overflow-hidden">
                {headerImageMobile ? (
                  <Image
                    width={800}
                    height={600}
                    src={headerImageMobile}
                    alt={data.title}
                    className="h-[220px] sm:h-[300px] w-full object-cover md:hidden"
                  />
                ) : null}
                {headerImage ? (
                  <Image
                    width={1920}
                    height={800}
                    src={headerImage}
                    alt={data.title}
                    className="hidden h-[280px] sm:h-[360px] md:h-[450px] w-full object-cover md:block"
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
                    className="h-[220px] w-full object-contain md:hidden"
                  />
                ) : null}
                {headerImage ? (
                  <Image
                    width={1200}
                    height={800}
                    src={headerImage}
                    alt={data.title}
                    className="hidden h-[250px] w-full object-contain md:block"
                  />
                ) : null}
              </div>
            )}
            {/* {!isDesignThree && (
              <div className="px-5 md:px-10 py-5 ">
                {/* {isFilledText(data.firstTitle) && (
                  <span className="hidden text-md my-3 font-medium text-gray-600 md:block">
                    {data.firstTitle}
                  </span>
                )}
                <h1 className="max-w-4xl text-2xl font-geist font-semibold leading-[1.05] tracking-tight text-black sm:text-5xl">
                  {data.title}
                </h1>
                {isFilledText(data.secondTitle) && (
                  <p className="mt-2 max-w-3xl text-md leading-8 text-gray-700">
                    {data.secondTitle}
                  </p>
                )} 
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={tag + idx}
                        className="rounded-md border border-[#d4d4d4] bg-[#efefef] px-2 py-1 text-sm font-medium text-black"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {/* <div className="mt-7 flex flex-wrap items-center gap-4 text-md text-black">
                  <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8e4ff] text-sm font-bold text-[#4f46e5]">
                      {(data.sideThumbName || "E").charAt(0)}
                    </span>
                    <span className="text-sm">
                      {data.sideThumbName || "Editorial Team"}
                    </span>
                  </div>
                  <span className="h-6 w-px bg-gray-400" />
                  <span className="text-sm">
                    {formatDate(data.updatedAt || data.createdAt) || ""}
                  </span>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
      <div className="mx-auto w-full md:max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className=" bg-background">
          {isDesignThree && (
            <section className="grid gap-6 py-4 md:px-5 md:py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
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
          )}

          {designOneLeadParagraph && (
            <section className="space-y-5 md:px-5 py-4 md:py-4 sm:px-8">
              {isFilledText(designOneLeadParagraph.title) && (
                <h2 className="text-3xl font-bold leading-tight text-gray-950">
                  {designOneLeadParagraph.title}
                </h2>
              )}
              <HtmlBlock html={designOneLeadParagraph.description} />
              {designOneLeadParagraphImages.length > 0 && (
                <div className="space-y-4">
                  <div
                    className={`grid gap-4 ${designOneLeadParagraphImages.length > 1 ? "sm:grid-cols-[2fr_1fr]" : "grid-cols-1"}`}
                  >
                    {designOneLeadParagraphImages.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="overflow-hidden rounded-md bg-[#f8f5ef]"
                      >
                        <img
                          src={image}
                          alt={
                            designOneLeadParagraph.title ||
                            `Lead image ${index + 1}`
                          }
                          className="md:h-[350px] w-full object-cover sm:h-[200px]"
                        />
                      </div>
                    ))}
                  </div>
                  {/* Bullet Points Section */}
                  {designOneLeadParagraph.bulletPoints &&
                    designOneLeadParagraph.bulletPoints.length > 0 &&
                    designOneLeadParagraph.bulletPoints.some((point) =>
                      isFilledText(point),
                    ) && (
                      <div className="space-y-3 mt-4">
                        {designOneLeadParagraph.bulletPoints.map(
                          (point, bulletIdx) =>
                            isFilledText(point) && (
                              <div key={bulletIdx} className="flex gap-3">
                                <span className="h-2 w-2 rounded-full bg-[#6156b0] mt-2 flex-shrink-0" />
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

          <div
            className={`grid gap-10 md:p-5 sm:px-8 bg-background ${isDesignThree ? "grid-cols-1" : hotelIsDesignTwo ? "lg:grid-cols-[330px_minmax(0,1fr)] lg:items-start" : "lg:grid-cols-[400px_1fr]"}`}
          >
            {isDesignThree ? (
              <>
                <main className="space-y-10">
                  {contentParagraphs.length > 0 &&
                    contentParagraphs.map((section, index) => {
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
                          <HtmlBlock html={section.description} className="text-sm" />
                          {sectionImages.length > 0 && (
                            <div
                              className={`grid gap-4 ${sectionImages.length > 1
                                  ? "grid-cols-1 sm:grid-cols-[2fr_1fr]"
                                  : "grid-cols-1"
                                }`}
                            >
                              {sectionImages.map((image, imgIndex) => (
                                <div
                                  key={`${image}-${imgIndex}`}
                                  className="h-[280px] mt-2 overflow-hidden rounded-image bg-[#f8f5ef] sm:h-[320px] md:h-[360px]"
                                >
                                  <Image
                                    width={1200}
                                    height={800}
                                    src={image}
                                    alt={
                                      section.title ||
                                      `Section image ${imgIndex + 1}`
                                    }
                                    className="h-full w-full object-cover"
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
                                      <div
                                        key={bulletIdx}
                                        className="flex gap-3"
                                      >
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
                                className={`border transition-colors ${index % 2 === 0 ? "bg-background" : "bg-surface"
                                  } hover:bg-background`}
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
                      <section
                        className={`rounded px-2 gap-2 flex flex-col py-5 text-black ${hotelIsDesignTwo ? "max-w-3xl" : ""}`}
                      >
                        <div className="rounded-[24px] border border-gray-800 bg-[linear-gradient(135deg,#fcfaf6,#f7f4ec,#e8efe0)] px-6 py-7 text-heading shadow-[0_20px_50px_rgba(120,135,79,0.12)]">
                          <Quote className="h-7 w-7 text-primary" />
                          {isFilledText(data.blockquoteMainTitle) && (
                            <h2 className="mt-3 text-2xl font-bold leading-tight mb-2 text-heading">
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
                                className="rounded-md w-fit border border-gray-500 px-3 py-2 text-[12px] text-black"
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
              </>
            ) : (
              <>
                <aside className="space-y-5 lg:sticky lg:top-20 bg-background">
                  <AuthorCard data={data} />
                  <StaticSidebarCard data={data} />
                  <GetInTouchCard pageTitle={data.title || data.firstTitle || ""} />
                  <ShareCard slug={data.slug} />
                </aside>

                <main className="space-y-10 bg-background">
                  {hotelIsDesignTwo && leadParagraph && (
                    <section className="space-y-5">
                      {isFilledText(leadParagraph.description) && (
                        <HtmlBlock
                          html={leadParagraph.description}
                          className="max-w-none text-left"
                        />
                      )}
                      {isFilledText(leadParagraph.title) && (
                        <h2 className="text-4xl font-bold leading-tight text-gray-950">
                          {leadParagraph.title}
                        </h2>
                      )}

                      {/* Bullet Points Section */}
                      {leadParagraph.bulletPoints &&
                        leadParagraph.bulletPoints.length > 0 &&
                        leadParagraph.bulletPoints.some((point) =>
                          isFilledText(point),
                        ) && (
                          <div className="space-y-3 mt-4">
                            {leadParagraph.bulletPoints.map(
                              (point, bulletIdx) =>
                                isFilledText(point) && (
                                  <div key={bulletIdx} className="flex gap-3">
                                    <span className="h-2 w-2 rounded-full bg-[#6156b0] mt-2 shrink-0" />
                                    <p className="text-sm leading-6 text-gray-600">
                                      {point}
                                    </p>
                                  </div>
                                ),
                            )}
                          </div>
                        )}
                      {leadParagraphImages.length > 0 && (
                        <div
                          className={`grid gap-4 ${leadParagraphImages.length > 1 ? "sm:grid-cols-[2fr_1fr]" : "grid-cols-1"}`}
                        >
                          {leadParagraphImages.map((image, index) => (
                            <div
                              key={`${image}-${index}`}
                              className="overflow-hidden rounded-md bg-[#f8f5ef]"
                            >
                              <Image
                                width={1200}
                                height={800}
                                src={image}
                                alt={
                                  leadParagraph.title ||
                                  `Lead image ${index + 1}`
                                }
                                className="md:h-[500px] w-full object-cover sm:h-[200px]"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {(hotelIsDesignTwo
                    ? contentParagraphs
                    : designOneRemainingParagraphs
                  ).length > 0 &&
                    (hotelIsDesignTwo
                      ? contentParagraphs
                      : designOneRemainingParagraphs
                    ).map((section, index) => {
                      const sectionImages = getSectionImages(section);
                      return (
                        <section
                          key={`${section.title}-${index}`}
                          className="space-y-5"
                        >
                          {isFilledText(section.title) && (
                            <h2
                              className={`${hotelIsDesignTwo ? "text-2xl" : "text-3xl"} font-bold leading-tight text-gray-950`}
                            >
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
                                    className="md:h-[250px] w-full object-cover sm:h-[200px]"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Bullet Points Section */}
                          {section.bulletPoints &&
                            section.bulletPoints.length > 0 &&
                            section.bulletPoints.some((point) =>
                              isFilledText(point),
                            ) && (
                              <div className="space-y-3 mt-4">
                                {section.bulletPoints.map(
                                  (point, bulletIdx) =>
                                    isFilledText(point) && (
                                      <div
                                        key={bulletIdx}
                                        className="flex gap-3"
                                      >
                                        <span className="h-2 w-2 rounded-full bg-[#6156b0] mt-2 shrink-0" />
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
                      <div className="overflow-hidden  border-[#ddd5ca] bg-white">
                        <table className="w-full text-left text-sm">
                          <tbody>
                            {tableRows.map((row, index) => (
                              <tr
                                key={`${row.column1}-${row.column2}-${index}`}
                                className={`border border-gray-800 ${index % 2 === 0 ? "bg-surface" : "bg-background"
                                  }`}
                              >
                                <td className="w-1/2 px-4 py-3 font-medium text-black border-r border-b border-gray-400">
                                  {row.column1 || "-"}
                                </td>
                                <td className="w-1/2 px-4 py-3 text-black font-medium border-b border-gray-400">
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
                      <section
                        className={`rounded px-2 gap-2 flex flex-col py-5 text-black ${hotelIsDesignTwo ? "max-w-3xl" : ""}`}
                      >
                        <div className="rounded-[24px] border border-gray-700 bg-[linear-gradient(135deg,#fcfaf6,#f7f4ec,#e8efe0)] px-6 py-7 text-heading shadow-[0_20px_50px_rgba(120,135,79,0.12)]">
                          <Quote className="h-7 w-7 text-primary" />
                          {isFilledText(data.blockquoteMainTitle) && (
                            <h2 className="mt-3 text-2xl font-bold leading-tight mb-2 text-heading">
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
                                className="rounded-md w-fit border border-gray-500 px-3 py-2 text-[12px] text-black"
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
                              className={`overflow-hidden rounded-lg border transition-all duration-300 ${isOpen
                                  ? "border-[#060606] bg-linear-to-br from-bg-background to-bg-background"
                                  : "border-[#e6dccf] bg-white"
                                }`}
                              style={{
                                transformOrigin: "top",
                                transition:
                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenAccordion(isOpen ? -1 : index)
                                }
                                className={`flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-all duration-300 ${isOpen
                                    ? "bg-linear-to-r from-bg-background to-bg-background"
                                    : "hover:bg-bg-background"
                                  }`}
                              >
                                <span
                                  className={`font-semibold transition-colors duration-300 ${isOpen ? "text-primary" : "text-gray-900 group-hover:text-gray-950"}`}
                                >
                                  {item.left || `Question ${index + 1}`}
                                </span>
                                <ChevronDown
                                  className={`h-5 w-5 shrink-0 transition-all duration-500 ${isOpen
                                      ? "rotate-180 text-primary"
                                      : "text-gray-500"
                                    }`}
                                />
                              </button>
                              <div
                                className={`grid transition-all duration-500 ease-in-out ${isOpen
                                    ? "grid-rows-[1fr] opacity-100"
                                    : "grid-rows-[0fr] opacity-0"
                                  }`}
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
              </>
            )}
          </div>
          {/* <PopularDestinations /> */}
        </div>
      </div>
    </div>
  );
}

export function Design1Page({ data }: { data: StorefrontWebpage }) {
  return <ClassicWebpageLayout data={data} variant="design1" />;
}

export function Design2Page({ data }: { data: StorefrontWebpage }) {
  return <ClassicWebpageLayout data={data} variant="design2" />;
}

export function Design3Page({ data }: { data: StorefrontWebpage }) {
  return <ClassicWebpageLayout data={data} variant="design3" />;
}
