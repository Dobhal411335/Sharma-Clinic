import type {
  HeroBannerConfigDto,
  HeroBannerFormValues,
  HeroBannerGridImageFormValues,
  HeroBannerLayoutType,
  HeroBannerSlideFormValues,
} from "@/types/admin/hero-banner";

function emptyImage() {
  return { url: "", publicId: "" };
}

function newClientKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `hero-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyGridImage(): HeroBannerGridImageFormValues {
  return {
    image: emptyImage(),
    alt: "",
    clickUrl: "",
  };
}

export function createEmptySlide(
  layoutType: HeroBannerLayoutType,
  order = 0,
): HeroBannerSlideFormValues {
  const gridImages =
    layoutType === "MULTI_IMAGE"
      ? [
          createEmptyGridImage(),
          createEmptyGridImage(),
          createEmptyGridImage(),
          createEmptyGridImage(),
        ]
      : [];

  return {
    clientKey: newClientKey(),
    layoutType,
    order,
    active: true,
    mobileImage: emptyImage(),
    desktopImage: emptyImage(),
    miniHeading: "",
    mainHeading: "",
    description: "",
    buttonLabel: "",
    buttonUrl: "",
    button2Label: "",
    button2Url: "",
    leftImage: emptyImage(),
    leftImageClickUrl: "",
    rightImage: emptyImage(),
    rightImageClickUrl: "",
    gridImages,
  };
}

export function createEmptyFormValues(): HeroBannerFormValues {
  return { slides: [] };
}

export function dtoToFormValues(dto: HeroBannerConfigDto): HeroBannerFormValues {
  return {
    slides: dto.slides.map((slide) => ({
      clientKey: slide.id || newClientKey(),
      layoutType: slide.layoutType,
      order: slide.order,
      active: slide.active,
      mobileImage: {
        url: slide.mobileImageUrl,
        publicId: slide.mobileImagePublicId,
      },
      desktopImage: {
        url: slide.desktopImageUrl,
        publicId: slide.desktopImagePublicId,
      },
      miniHeading: slide.miniHeading,
      mainHeading: slide.mainHeading,
      description: slide.description,
      buttonLabel: slide.buttonLabel,
      buttonUrl: slide.buttonUrl,
      button2Label: slide.button2Label,
      button2Url: slide.button2Url,
      leftImage: {
        url: slide.leftImageUrl,
        publicId: slide.leftImagePublicId,
      },
      leftImageClickUrl: slide.leftImageClickUrl,
      rightImage: {
        url: slide.rightImageUrl,
        publicId: slide.rightImagePublicId,
      },
      rightImageClickUrl: slide.rightImageClickUrl,
      gridImages: slide.gridImages.map((image) => ({
        image: { url: image.imageUrl, publicId: image.imagePublicId },
        alt: image.alt,
        clickUrl: image.clickUrl,
      })),
    })),
  };
}

export const HERO_TAB_META: Array<{
  layoutType: HeroBannerLayoutType;
  label: string;
  description: string;
}> = [
  {
    layoutType: "FULL_WIDTH",
    label: "Full-width banner",
    description:
      "Full-bleed hero with mobile/laptop images and an optional click URL.",
  },
  {
    layoutType: "SPLIT_DUAL",
    label: "Split / triptych",
    description:
      "Two laptop side images with centered copy and dual CTAs. Mobile uses the left image with overlay copy.",
  },
  {
    layoutType: "MULTI_IMAGE",
    label: "Associate brands",
    description: "Heading, CTA, and a 4–6 image brand grid (no background banner images).",
  },
];
