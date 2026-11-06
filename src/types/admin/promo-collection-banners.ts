export type PromoBannerItemFormValues = {
  clientKey: string;
  miniHeading: string;
  heading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  active: boolean;
};

export type PromoBannerFormValues = {
  items: PromoBannerItemFormValues[];
};

export type PromoBannerItemDto = {
  id: string;
  miniHeading: string;
  heading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  sortOrder: number;
  active: boolean;
};

export type PromoBannerConfigDto = {
  id: string | null;
  siteCode: "IN" | "COM";
  items: PromoBannerItemDto[];
  updatedAt: string | null;
};

export type PromoBannerConfigPayload = {
  items: Array<{
    miniHeading: string;
    heading: string;
    description: string;
    buttonLabel: string;
    buttonUrl: string;
    sortOrder: number;
    active: boolean;
  }>;
};

export type CollectionBannerItemFormValues = {
  clientKey: string;
  image: { url: string; publicId: string };
  title: string;
  description: string;
  buttonUrl: string;
  button1Label: string;
  button1Url: string;
  button2Label: string;
  button2Url: string;
  active: boolean;
};

export type CollectionBannerFormValues = {
  sectionLabel: string;
  sectionHeading: string;
  items: CollectionBannerItemFormValues[];
};

export type CollectionBannerItemDto = {
  id: string;
  imageUrl: string;
  imagePublicId: string;
  title: string;
  description: string;
  buttonUrl: string;
  button1Label: string;
  button1Url: string;
  button2Label: string;
  button2Url: string;
  sortOrder: number;
  active: boolean;
};

export type CollectionBannerConfigDto = {
  id: string | null;
  siteCode: "IN" | "COM";
  sectionLabel: string;
  sectionHeading: string;
  items: CollectionBannerItemDto[];
  updatedAt: string | null;
};

export type CollectionBannerConfigPayload = {
  sectionLabel: string;
  sectionHeading: string;
  items: Array<{
    imageUrl: string;
    imagePublicId: string;
    title: string;
    description: string;
    buttonUrl: string;
    button1Label: string;
    button1Url: string;
    button2Label: string;
    button2Url: string;
    sortOrder: number;
    active: boolean;
  }>;
};
