import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { pageSeo } from "@/data/site";
import { WebPage } from "@/features/webpages/WebPage";
import { getWebpageBySlug } from "@/features/webpages/webpage.service";
import type { StorefrontWebpage } from "@/features/webpages/webpage.types";

type WebpageSlugPageProps = {
  params: Promise<{ slug: string }>;
};

function descriptionFromWebpage(page: StorefrontWebpage): string {
  const candidates: string[] = [];
  if (page.secondTitle?.trim()) candidates.push(page.secondTitle.trim());
  if (page.design9Description?.trim()) {
    candidates.push(page.design9Description.replace(/<[^>]+>/g, " ").trim());
  }
  if (page.design5MainHeading?.trim()) candidates.push(page.design5MainHeading.trim());
  if (page.design6MainHeading?.trim()) candidates.push(page.design6MainHeading.trim());
  if (page.design7MainHeading?.trim()) candidates.push(page.design7MainHeading.trim());
  if (Array.isArray(page.highlights)) {
    for (const item of page.highlights) {
      const point = typeof item?.point === "string" ? item.point.trim() : "";
      if (point) candidates.push(point);
    }
  }
  if (Array.isArray(page.paragraphSections)) {
    for (const section of page.paragraphSections) {
      const text =
        typeof section?.description === "string"
          ? section.description.replace(/<[^>]+>/g, " ").trim()
          : "";
      if (text) candidates.push(text);
    }
  }
  const raw = candidates.find(Boolean) || page.title || "";
  return raw.replace(/\s+/g, " ").trim().slice(0, 160);
}

function ogImageFromWebpage(page: StorefrontWebpage): string | undefined {
  return (
    page.bannerImage?.url ||
    page.imageFirst?.url ||
    page.bannerImageMobile?.url ||
    page.imageFirstMobile?.url ||
    undefined
  );
}

export async function generateMetadata({
  params,
}: WebpageSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getWebpageBySlug(slug);
  if (!page) {
    return { title: pageSeo.notFound.title };
  }

  const title = (page.titleLine || page.title || "Page").trim();
  const description = descriptionFromWebpage(page);
  const image = ogImageFromWebpage(page);
  const keywords = Array.isArray(page.keywords)
    ? page.keywords.filter(Boolean)
    : [];

  return {
    title,
    description: description || undefined,
    keywords: keywords.length ? keywords : undefined,
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

export default async function WebpageSlugPage({ params }: WebpageSlugPageProps) {
  const { slug } = await params;
  const page = await getWebpageBySlug(slug);
  if (!page) {
    notFound();
  }

  return <WebPage data={page} />;
}
