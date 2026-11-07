"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { HtmlBlock } from "@/features/webpages/utils/html-block";
import { isFilledText } from "@/features/webpages/utils/is-filled-text";
import type {
  StorefrontGridCard,
  StorefrontWebpage,
} from "@/features/webpages/webpage.types";

function youtubeEntryUrl(
  entry: string | { url?: string } | null | undefined,
): string {
  if (!entry) return "";
  if (typeof entry === "string") return entry.trim();
  return typeof entry.url === "string" ? entry.url.trim() : "";
}

function getYouTubeId(url: string): string {
  if (!url) return "";
  if (url.includes("v=")) return url.split("v=")[1]?.split("&")[0] || "";
  if (url.includes("youtu.be/"))
    return url.split("youtu.be/")[1]?.split("?")[0] || "";
  if (url.includes("/shorts/"))
    return url.split("/shorts/")[1]?.split("?")[0] || "";
  return "";
}

type Design7GalleryPageProps = {
  galleryCard: StorefrontGridCard;
  webpage: StorefrontWebpage;
};

export function Design7GalleryPage({
  galleryCard,
  webpage,
}: Design7GalleryPageProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const bentoImages = galleryCard.bentoImages || [];
  const allGalleryImages: string[] = [];
  if (galleryCard.image?.url) allGalleryImages.push(galleryCard.image.url);
  for (const img of bentoImages) {
    if (img.url) allGalleryImages.push(img.url);
  }

  const youtubeShorts = (galleryCard.youtubeShorts || [])
    .map(youtubeEntryUrl)
    .filter(Boolean);
  const youtubeVideos = (galleryCard.youtubeVideos || [])
    .map(youtubeEntryUrl)
    .filter(Boolean);

  const chipLabel =
    galleryCard.chipName || webpage.design7Chip || "News & Insight";

  return (
    <div className="min-h-screen bg-background font-geist text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="inline-block rounded-full border border-gray-400 px-4 py-1 text-sm font-medium text-gray-600">
            {chipLabel}
          </div>
          <Link
            href={`/${webpage.slug}`}
            className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-4 py-1 text-sm font-semibold text-gray-700 hover:text-black"
          >
            Back To Gallery
            <svg
              className="ml-1 h-4 w-4 rotate-45 transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="mb-8 max-w-3xl font-serif text-3xl leading-tight text-gray-800 md:text-5xl">
            {galleryCard.title || "Gallery"}
          </h1>

          <div className="mb-4 flex items-center justify-end text-sm font-semibold text-gray-800">
            {isFilledText(galleryCard.galleryDate) ? (
              <span className="mr-3">Date : {galleryCard.galleryDate}</span>
            ) : null}
            {isFilledText(galleryCard.galleryDate) &&
            isFilledText(galleryCard.postedBy) ? (
              <span className="mx-2">|</span>
            ) : null}
            {isFilledText(galleryCard.postedBy) ? (
              <span className="ml-3">Posted By : {galleryCard.postedBy}</span>
            ) : null}
          </div>

          <hr className="mb-8 border-gray-300" />

          {isFilledText(galleryCard.galleryDescription) ? (
            <HtmlBlock
              html={galleryCard.galleryDescription}
              className="max-w-2xl text-lg text-gray-600"
            />
          ) : null}
        </div>

        <div className="mb-20">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-200 group md:col-span-1 md:row-span-2 md:min-h-[420px] md:aspect-auto">
              {galleryCard.image?.url ? (
                <Image
                  src={galleryCard.image.url}
                  alt={galleryCard.title || "Main gallery"}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  Main Image
                </div>
              )}
              {allGalleryImages.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowGallery(true)}
                  className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-black/80"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                  VIEW GALLERY
                </button>
              ) : null}
            </div>

            {showGallery ? (
              <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95">
                <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4">
                  <h3 className="truncate pr-4 text-lg font-semibold text-white">
                    {galleryCard.title || "Gallery"}
                    <span className="ml-4 text-sm font-normal text-gray-300">
                      {currentImageIndex + 1} / {allGalleryImages.length}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGallery(false);
                      setCurrentImageIndex(0);
                    }}
                    className="flex-shrink-0 rounded-full bg-white/10 p-2 text-white transition-all hover:bg-white/20 hover:text-gray-300"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="relative flex h-full w-full items-center justify-center px-4 py-20 md:px-20">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? allGalleryImages.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-4 z-20 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/80 md:left-10"
                  >
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {allGalleryImages.length > 0 ? (
                    <div className="relative h-full w-full max-w-5xl">
                      <Image
                        src={allGalleryImages[currentImageIndex]}
                        alt={`Gallery view ${currentImageIndex + 1}`}
                        fill
                        sizes="100vw"
                        className="rounded-lg object-contain shadow-2xl transition-opacity duration-300"
                      />
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === allGalleryImages.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-4 z-20 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/80 md:right-10"
                  >
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : null}

            {bentoImages.length > 0
              ? bentoImages.slice(0, 4).map((img, i) => (
                  <div
                    key={`bento-top-${i}`}
                    className="relative aspect-video overflow-hidden rounded-lg bg-gray-200 md:aspect-[4/3]"
                  >
                    <Image
                      src={img.url}
                      alt={`Gallery ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ))
              : [1, 2, 3, 4].map((n) => (
                  <div
                    key={`bento-placeholder-${n}`}
                    className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-200 text-gray-400 md:aspect-[4/3]"
                  >
                    <span className="text-sm">Image {n}</span>
                  </div>
                ))}

            <div className="mt-4 grid grid-cols-2 gap-4 md:col-span-3 md:grid-cols-5">
              {bentoImages.length > 4
                ? bentoImages.slice(4, 9).map((img, i) => (
                    <div
                      key={`bento-extra-${i}`}
                      className="relative aspect-video overflow-hidden rounded-lg bg-gray-200"
                    >
                      <Image
                        src={img.url}
                        alt={`Gallery extra ${i + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover"
                      />
                    </div>
                  ))
                : [1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={`thumb-placeholder-${n}`}
                      className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-200 text-gray-400"
                    >
                      <span className="text-sm">Thumbnail {n}</span>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {youtubeShorts.length > 0 ? (
          <div className="mb-20">
            <div className="mb-6 flex items-center gap-2">
              <svg
                className="h-6 w-6 text-red-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21.582 6.186a2.686 2.686 0 00-1.884-1.895C17.986 3.84 12 3.84 12 3.84s-5.986 0-7.698.451a2.686 2.686 0 00-1.884 1.895C2 7.897 2 12 2 12s0 4.103.418 5.814a2.686 2.686 0 001.884 1.895C6.014 20.16 12 20.16 12 20.16s5.986 0 7.698-.451a2.686 2.686 0 001.884-1.895C22 16.103 22 12 22 12s0-4.103-.418-5.814zM9.953 15.228V8.772l5.518 3.228-5.518 3.228z" />
              </svg>
              <h2 className="text-2xl font-bold">Shorts</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {youtubeShorts.map((url, idx) => {
                const id = getYouTubeId(url);
                if (!id) return null;
                return (
                  <div key={`short-${idx}`} className="flex flex-col gap-2">
                    <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-black">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${id}`}
                        title={`YouTube Short ${idx + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="absolute inset-0"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {youtubeVideos.length > 0 ? (
          <div className="mb-20">
            <div className="mb-6 flex items-center gap-2">
              <svg
                className="h-6 w-6 text-red-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21.582 6.186a2.686 2.686 0 00-1.884-1.895C17.986 3.84 12 3.84 12 3.84s-5.986 0-7.698.451a2.686 2.686 0 00-1.884 1.895C2 7.897 2 12 2 12s0 4.103.418 5.814a2.686 2.686 0 001.884 1.895C6.014 20.16 12 20.16 12 20.16s5.986 0 7.698-.451a2.686 2.686 0 001.884-1.895C22 16.103 22 12 22 12s0-4.103-.418-5.814zM9.953 15.228V8.772l5.518 3.228-5.518 3.228z" />
              </svg>
              <h2 className="text-2xl font-bold">Videos</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {youtubeVideos.map((url, idx) => {
                const id = getYouTubeId(url);
                if (!id) return null;
                return (
                  <div key={`video-${idx}`} className="flex flex-col gap-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${id}`}
                        title={`YouTube Video ${idx + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="absolute inset-0"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
