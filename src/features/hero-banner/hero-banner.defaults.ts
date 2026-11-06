import { heroAssociateFallback } from "@/data/landing";
import type { StorefrontHeroSlide } from "@/types/hero-banner";

/** Static fallback slides when the API returns no active hero banners. */
export const FALLBACK_HERO_SLIDES: StorefrontHeroSlide[] = [
  {
    id: "fallback-multi",
    layoutType: "MULTI_IMAGE",
    miniHeading: "",
    mainHeading: heroAssociateFallback.title,
    description: heroAssociateFallback.body,
    buttonLabel: heroAssociateFallback.cta.label,
    buttonUrl: heroAssociateFallback.cta.href,
    button2Label: "",
    button2Url: "",
    mobileImageUrl: "",
    desktopImageUrl: "",
    leftImageUrl: "",
    leftImageClickUrl: "",
    rightImageUrl: "",
    rightImageClickUrl: "",
    gridImages: heroAssociateFallback.partners.map((partner) => ({
      id: partner.id,
      src: "",
      alt: partner.name,
      clickUrl: "",
    })),
  },
];
