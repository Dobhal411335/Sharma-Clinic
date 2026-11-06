export type PopupBannerConfig = {
  id: string | null;
  siteCode: "IN" | "COM";
  imageUrl: string;
  imagePublicId: string;
  miniHeading: string;
  heading: string;
  subDescription: string;
  buttonLabel: string;
  buttonUrl: string;
  active: boolean;
  updatedAt: string | null;
};

export type StorefrontPopupBanner = {
  imageUrl: string;
  imageAlt: string;
  miniHeading: string;
  heading: string;
  subDescription: string;
  buttonLabel: string;
  buttonUrl: string;
};
