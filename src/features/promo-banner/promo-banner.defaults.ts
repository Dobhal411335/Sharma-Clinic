import { promos } from "@/data/landing";
import type { StorefrontPromoBanner } from "@/types/promo-banner";

export const FALLBACK_PROMO_BANNERS: StorefrontPromoBanner[] = promos.map((promo) => ({
  id: promo.id,
  miniHeading: "",
  heading: promo.title,
  description: promo.description,
  buttonLabel: "Explore",
  href: promo.href,
}));
