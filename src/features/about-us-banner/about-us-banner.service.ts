import { cache } from "react";

import { FALLBACK_ABOUT_US_BANNER } from "@/features/about-us-banner/about-us-banner.defaults";
import type {
  AboutUsBannerConfig,
  StorefrontAboutUsBanner,
} from "@/types/about-us-banner";

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

const STOREFRONT_SITE_CODE = "IN" as const;

function apiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) return "";
  return value.replace(/\/$/, "");
}

function preferHttps(url: string): string {
  return url.startsWith("http://res.cloudinary.com/") ? `https://${url.slice(7)}` : url;
}

export function mapAboutUsBanner(config: AboutUsBannerConfig): StorefrontAboutUsBanner {
  const services = [...(config.services || [])]
    .filter((service) => service.active !== false && service.heading.trim())
    .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
    .map((service) => ({
      id: service.id,
      buttonLabel: service.buttonLabel.trim(),
      heading: service.heading.trim(),
      description: service.description.trim(),
      image: {
        src: preferHttps(service.imageUrl.trim()),
        alt: service.heading.trim(),
      },
      highlights: [...(service.highlights || [])]
        .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
        .map((item) => item.text.trim())
        .filter(Boolean),
      doctor: {
        image: {
          src: preferHttps(service.doctorImageUrl.trim()),
          alt: service.doctorName.trim() || service.heading.trim(),
        },
        name: service.doctorName.trim(),
        designation: service.doctorDesignation.trim(),
        cta: {
          label: service.doctorButtonLabel.trim() || "View profile",
          href: service.doctorButtonUrl.trim() || "/doctors",
        },
      },
    }));

  return {
    promo: {
      label: config.promoLabel.trim() || FALLBACK_ABOUT_US_BANNER.promo.label,
      title: config.promoHeading.trim() || FALLBACK_ABOUT_US_BANNER.promo.title,
      description: (config.promoDescription || config.promoSubheading).trim(),
      subtitle: config.promoSubheading.trim(),
      cta: {
        label: config.promoButtonLabel.trim() || FALLBACK_ABOUT_US_BANNER.promo.cta.label,
        href: config.promoButtonUrl.trim() || FALLBACK_ABOUT_US_BANNER.promo.cta.href,
      },
      cards: [],
    },
    aboutCards: [...(config.aboutCards || [])]
      .filter((card) => card.active !== false && card.heading.trim())
      .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
      .map((card) => ({
        id: card.id,
        label: card.label.trim(),
        title: card.heading.trim(),
        body: card.description.trim(),
        cta: {
          label: card.buttonLabel.trim() || "Read more",
          href: card.buttonUrl.trim() || "/about",
        },
        image: {
          src: preferHttps(card.imageUrl.trim()),
          alt: card.heading.trim(),
        },
      })),
    highlightItems: [...(config.highlightItems || [])]
      .filter((item) => item.active !== false && item.heading.trim())
      .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
      .map((item) => ({
        id: item.id,
        title: item.heading.trim(),
        image: preferHttps(item.imageUrl.trim()),
        alt: item.heading.trim(),
        href: item.buttonUrl.trim() || "/doctors",
        buttonLabel: item.buttonLabel.trim(),
      })),
    textSlides: [...(config.textSlides || [])]
      .filter((slide) => slide.active !== false && slide.heading.trim())
      .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
      .map((slide) => ({
        id: slide.id,
        title: slide.heading.trim(),
        body: slide.subheading.trim(),
      })),
    servicesHeading:
      config.servicesHeading?.trim() || FALLBACK_ABOUT_US_BANNER.servicesHeading,
    servicesViewAll: {
      label: config.servicesViewAllLabel?.trim() || FALLBACK_ABOUT_US_BANNER.servicesViewAll.label,
      href: config.servicesViewAllUrl?.trim() || FALLBACK_ABOUT_US_BANNER.servicesViewAll.href,
    },
    services,
  };
}

export const getAboutUsBanner = cache(async (): Promise<StorefrontAboutUsBanner> => {
  try {
    const { readSingleton, withSite } = await import("@/features/cms/store");
    const row = await readSingleton("about-us-banner");
    if (!row) return FALLBACK_ABOUT_US_BANNER;
    const data = withSite(row.payload, {
      id: "about-us-banner",
      updatedAt: row.updatedAt,
    }) as unknown as AboutUsBannerConfig;
    return mapAboutUsBanner(data);
  } catch {
    return FALLBACK_ABOUT_US_BANNER;
  }
});
