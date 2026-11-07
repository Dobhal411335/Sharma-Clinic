import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { pageSeo } from "@/data/site";
import { Design7GalleryPage } from "@/features/webpages/designs/Design7GalleryPage";
import { getWebpageGalleryBySlug } from "@/features/webpages/webpage.service";

type GallerySlugPageProps = {
  params: Promise<{ slug: string }>;
};

function plainDescription(html: string | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

export async function generateMetadata({
  params,
}: GallerySlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getWebpageGalleryBySlug(slug);
  if (!detail) {
    return { title: pageSeo.notFound.title };
  }

  const title = (detail.galleryCard.title || "Gallery").trim();
  const description = plainDescription(detail.galleryCard.galleryDescription);
  const image = detail.galleryCard.image?.url;

  return {
    title,
    description: description || undefined,
    openGraph: {
      title,
      description: description || undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description: description || undefined,
      images: image ? [image] : undefined,
    },
  };
}

export default async function GallerySlugPage({ params }: GallerySlugPageProps) {
  const { slug } = await params;
  const detail = await getWebpageGalleryBySlug(slug);
  if (!detail) {
    notFound();
  }

  return (
    <Design7GalleryPage
      galleryCard={detail.galleryCard}
      webpage={detail.webpage}
    />
  );
}
