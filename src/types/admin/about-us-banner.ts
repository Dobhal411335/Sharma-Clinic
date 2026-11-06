export type AboutUsImageRef = {
  url: string;
  publicId: string;
};

export type AboutUsAboutCardFormValues = {
  image: AboutUsImageRef;
  label: string;
  heading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  active: boolean;
};

export type AboutUsHighlightItemFormValues = {
  image: AboutUsImageRef;
  heading: string;
  buttonLabel: string;
  buttonUrl: string;
  active: boolean;
};

export type AboutUsTextSlideFormValues = {
  heading: string;
  subheading: string;
  active: boolean;
};

export type AboutUsServiceHighlightFormValues = { text: string };

export type AboutUsServiceFormValues = {
  image: AboutUsImageRef;
  buttonLabel: string;
  heading: string;
  description: string;
  highlights: AboutUsServiceHighlightFormValues[];
  doctorImage: AboutUsImageRef;
  doctorName: string;
  doctorDesignation: string;
  doctorButtonLabel: string;
  doctorButtonUrl: string;
  active: boolean;
};

export type AboutUsBannerFormValues = {
  promoLabel: string;
  promoHeading: string;
  promoDescription?: string;
  promoSubheading: string;
  promoButtonLabel: string;
  promoButtonUrl: string;
  servicesHeading?: string;
  servicesViewAllLabel?: string;
  servicesViewAllUrl?: string;
  aboutCards: AboutUsAboutCardFormValues[];
  highlightItems: AboutUsHighlightItemFormValues[];
  textSlides: AboutUsTextSlideFormValues[];
  services?: AboutUsServiceFormValues[];
};

export type AboutUsAboutCardDto = {
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

export type AboutUsHighlightItemDto = {
  id: string;
  imageUrl: string;
  imagePublicId: string;
  heading: string;
  buttonLabel: string;
  buttonUrl: string;
  sortOrder: number;
  active: boolean;
};

export type AboutUsTextSlideDto = {
  id: string;
  heading: string;
  subheading: string;
  sortOrder: number;
  active: boolean;
};

export type AboutUsServiceDto = {
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

export type AboutUsBannerConfigDto = {
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
  aboutCards: AboutUsAboutCardDto[];
  highlightItems: AboutUsHighlightItemDto[];
  textSlides: AboutUsTextSlideDto[];
  services?: AboutUsServiceDto[];
  updatedAt: string | null;
};

export type AboutUsBannerConfigPayload = {
  promoLabel: string;
  promoHeading: string;
  promoDescription: string;
  promoSubheading: string;
  promoButtonLabel: string;
  promoButtonUrl: string;
  servicesHeading?: string;
  servicesViewAllLabel?: string;
  servicesViewAllUrl?: string;
  aboutCards: Array<{
    imageUrl: string;
    imagePublicId: string;
    label: string;
    heading: string;
    description: string;
    buttonLabel: string;
    buttonUrl: string;
    active: boolean;
    sortOrder: number;
  }>;
  highlightItems: Array<{
    imageUrl: string;
    imagePublicId: string;
    heading: string;
    buttonLabel: string;
    buttonUrl: string;
    active: boolean;
    sortOrder: number;
  }>;
  textSlides: Array<{
    heading: string;
    subheading: string;
    active: boolean;
    sortOrder: number;
  }>;
  services?: Array<{
    imageUrl: string;
    imagePublicId: string;
    buttonLabel: string;
    heading: string;
    description: string;
    highlights: Array<{ text: string; sortOrder: number }>;
    doctorImageUrl: string;
    doctorImagePublicId: string;
    doctorName: string;
    doctorDesignation: string;
    doctorButtonLabel: string;
    doctorButtonUrl: string;
    active: boolean;
    sortOrder: number;
  }>;
};
