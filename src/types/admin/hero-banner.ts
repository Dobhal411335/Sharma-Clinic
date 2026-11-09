import type { SiteCode } from "@/types/admin/auth";

export type HeroBannerLayoutType =
  | "FULL_WIDTH"
  | "SPLIT_DUAL"
  | "MULTI_IMAGE"
  | "DOCTOR_BANNER";

export type HeroBannerImageValue = {
  url: string;
  publicId: string;
};

export type HeroBannerGridImageFormValues = {
  image: HeroBannerImageValue;
  alt: string;
  clickUrl: string;
};

export type HeroBannerSlideFormValues = {
  clientKey: string;
  layoutType: HeroBannerLayoutType;
  order: number;
  active: boolean;
  mobileImage: HeroBannerImageValue;
  desktopImage: HeroBannerImageValue;
  miniHeading: string;
  mainHeading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  button2Label: string;
  button2Url: string;
  leftImage: HeroBannerImageValue;
  leftImageClickUrl: string;
  rightImage: HeroBannerImageValue;
  rightImageClickUrl: string;
  secondaryHeading: string;
  secondaryDescription: string;
  callNumber: string;
  gridImages: HeroBannerGridImageFormValues[];
};

export type HeroBannerFormValues = {
  slides: HeroBannerSlideFormValues[];
};

export type HeroBannerGridImageDto = {
  id: string;
  imageUrl: string;
  imagePublicId: string;
  alt: string;
  clickUrl: string;
  order: number;
};

export type HeroBannerSlideDto = {
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
  leftImageClickUrl: string;
  rightImageUrl: string;
  rightImagePublicId: string;
  rightImageClickUrl: string;
  secondaryHeading: string;
  secondaryDescription: string;
  callNumber: string;
  gridImages: HeroBannerGridImageDto[];
};

export type HeroBannerConfigDto = {
  siteCode: SiteCode;
  slides: HeroBannerSlideDto[];
};

export type HeroBannerSlidePayload = {
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
  leftImageClickUrl: string;
  rightImageUrl: string;
  rightImagePublicId: string;
  rightImageClickUrl: string;
  secondaryHeading: string;
  secondaryDescription: string;
  callNumber: string;
  gridImages: Array<{
    imageUrl: string;
    imagePublicId: string;
    alt: string;
    clickUrl: string;
    order: number;
  }>;
};

export type HeroBannerConfigPayload = {
  slides: HeroBannerSlidePayload[];
};
