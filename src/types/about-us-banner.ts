export type AboutUsBannerConfig = {
  id: string | null;
  siteCode: "IN" | "COM";
  promoLabel: string;
  promoHeading: string;
  promoDescription?: string;
  promoSubheading: string;
  promoButtonLabel: string;
  promoButtonUrl: string;
  servicesHeading?: string;
  servicesViewAllLabel?: string;
  servicesViewAllUrl?: string;
  aboutCards: AboutUsAboutCard[];
  highlightItems?: AboutUsHighlightItem[];
  textSlides?: AboutUsTextSlide[];
  services?: AboutUsService[];
  updatedAt: string | null;
};

export type AboutUsAboutCard = {
  id: string;
  imageUrl: string;
  imagePublicId: string;
  label: string;
  heading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  sortOrder: number;
  active: boolean;
};

export type AboutUsHighlightItem = {
  id: string;
  imageUrl: string;
  imagePublicId: string;
  heading: string;
  buttonLabel: string;
  buttonUrl: string;
  sortOrder: number;
  active: boolean;
};

export type AboutUsTextSlide = {
  id: string;
  heading: string;
  subheading: string;
  sortOrder: number;
  active: boolean;
};

export type AboutUsService = {
  id: string;
  imageUrl: string;
  imagePublicId: string;
  buttonLabel: string;
  heading: string;
  description: string;
  highlights: Array<{ id: string; text: string; sortOrder: number }>;
  doctorImageUrl: string;
  doctorImagePublicId: string;
  doctorName: string;
  doctorDesignation: string;
  doctorButtonLabel: string;
  doctorButtonUrl: string;
  sortOrder: number;
  active: boolean;
};

export type StorefrontPromoHeader = {
  label: string;
  title: string;
  description: string;
  subtitle: string;
  cta: { label: string; href: string };
  cards: Array<{ id: string; title: string; body: string }>;
};

export type StorefrontAboutCard = {
  id: string;
  label: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  image: { src: string; alt: string };
};

export type StorefrontHighlightItem = {
  id: string;
  title: string;
  image: string;
  alt: string;
  href: string;
  buttonLabel: string;
};

export type StorefrontTextSlide = {
  id: string;
  title: string;
  body: string;
};

export type StorefrontService = {
  id: string;
  buttonLabel: string;
  heading: string;
  description: string;
  image: { src: string; alt: string };
  highlights: string[];
  doctor: {
    image: { src: string; alt: string };
    name: string;
    designation: string;
    cta: { label: string; href: string };
  };
};

export type StorefrontAboutUsBanner = {
  promo: StorefrontPromoHeader;
  aboutCards: StorefrontAboutCard[];
  highlightItems: StorefrontHighlightItem[];
  textSlides: StorefrontTextSlide[];
  servicesHeading: string;
  servicesViewAll: { label: string; href: string };
  services: StorefrontService[];
};
