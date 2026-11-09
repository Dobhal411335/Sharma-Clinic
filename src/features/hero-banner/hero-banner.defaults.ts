import type { StorefrontHeroSlide } from "@/types/hero-banner";

/** Static fallback slides when the API returns no active hero banners. */
export const FALLBACK_HERO_SLIDES: StorefrontHeroSlide[] = [
  {
    id: "fallback-doctor",
    layoutType: "DOCTOR_BANNER",
    miniHeading: "Healthcare",
    mainHeading: "Safeguarding Tomorrow: Our Oath to Preserve Lives",
    description:
      "Embrace a world of comprehensive healthcare where your well-being takes center stage. We're dedicated to providing you with personalized medical services.",
    buttonLabel: "Learn More",
    buttonUrl: "/doctors",
    button2Label: "",
    button2Url: "",
    mobileImageUrl: "",
    desktopImageUrl: "",
    leftImageUrl: "",
    leftImageClickUrl: "",
    rightImageUrl: "",
    rightImageClickUrl: "",
    secondaryHeading: "Welcome To Our Clinic.",
    secondaryDescription:
      "We are open 24/7 at your service. For online appointment or emergency service at anytime.",
    callNumber: "",
    gridImages: [],
  },
];
