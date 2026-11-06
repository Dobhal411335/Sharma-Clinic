import { about, specials } from "@/data/landing";
import type { StorefrontAboutUsBanner } from "@/types/about-us-banner";

export const FALLBACK_ABOUT_US_BANNER: StorefrontAboutUsBanner = {
  promo: {
    label: specials.label,
    title: specials.title,
    description: specials.subtitle,
    subtitle: specials.subtitle,
    cta: specials.cta,
    cards: [],
  },
  aboutCards: [
    {
      id: "about-fallback",
      label: about.label,
      title: about.title,
      body: about.body,
      cta: about.cta,
      image: about.image,
    },
  ],
  highlightItems: [],
  textSlides: [],
  servicesHeading: "Caring for your child, every step of the way",
  servicesViewAll: { label: "View all services", href: "/services" },
  services: [],
};
