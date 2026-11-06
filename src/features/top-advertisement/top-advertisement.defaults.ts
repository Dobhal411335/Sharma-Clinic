import { announcement, featureBenefits } from "@/data/landing";
import type { StorefrontTopAdvertisement } from "@/types/top-advertisement";

export const FALLBACK_TOP_ADVERTISEMENT: StorefrontTopAdvertisement = {
  announcements: [{ text: announcement }],
  utilityItems: [
    { text: "India storefront · Prices in INR" },
    { text: "Complimentary shipping over ₹999" },
  ],
  benefits: featureBenefits.map((item) => ({
    title: item.title,
  })),
};
