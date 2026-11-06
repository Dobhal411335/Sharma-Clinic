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

export type StorefrontPromoBanner = {
  id: string;
  miniHeading: string;
  heading: string;
  description: string;
  buttonLabel: string;
  href: string;
};
