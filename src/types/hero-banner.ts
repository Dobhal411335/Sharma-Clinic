export type HeroBannerLayoutType = "FULL_WIDTH" | "SPLIT_DUAL" | "MULTI_IMAGE";

export type HeroBannerGridImage = {
  id: string;
  imageUrl: string;
  imagePublicId: string;
  alt: string;
  clickUrl: string;
  order: number;
};

export type HeroBannerSlide = {
  id: string;
  layoutType: HeroBannerLayoutType;
  order: number;
  active: boolean;
  mobileImageUrl: string;
  mobileImagePublicId: string;
  desktopImageUrl: string;
  desktopImagePublicId: string;
  miniHeading: string;
  mainHeading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  button2Label: string;
  button2Url: string;
  leftImageUrl: string;
  leftImagePublicId: string;
  leftImageClickUrl?: string;
  rightImageUrl: string;
  rightImagePublicId: string;
  rightImageClickUrl?: string;
  gridImages: HeroBannerGridImage[];
};

export type HeroBannerConfig = {
  siteCode: "IN" | "COM";
  slides: HeroBannerSlide[];
};

export type StorefrontHeroSlide = {
  id: string;
  layoutType: HeroBannerLayoutType;
  miniHeading: string;
  mainHeading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  button2Label: string;
  button2Url: string;
  mobileImageUrl: string;
  desktopImageUrl: string;
  leftImageUrl: string;
  leftImageClickUrl: string;
  rightImageUrl: string;
  rightImageClickUrl: string;
  gridImages: Array<{ id: string; src: string; alt: string; clickUrl: string }>;
};
