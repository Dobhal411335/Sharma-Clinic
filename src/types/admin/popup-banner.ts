export type PopupBannerImageRef = {
  url: string;
  publicId: string;
};

export type PopupBannerFormValues = {
  image: PopupBannerImageRef;
  miniHeading: string;
  heading: string;
  subDescription: string;
  buttonLabel: string;
  buttonUrl: string;
  active: boolean;
};

export type PopupBannerConfigDto = {
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

export type PopupBannerConfigPayload = {
  imageUrl: string;
  imagePublicId: string;
  miniHeading: string;
  heading: string;
  subDescription: string;
  buttonLabel: string;
  buttonUrl: string;
  active: boolean;
};
