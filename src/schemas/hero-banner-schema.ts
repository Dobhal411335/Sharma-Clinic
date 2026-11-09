import type {
  HeroBannerConfigPayload,
  HeroBannerFormValues,
  HeroBannerSlideFormValues,
} from "@/types/admin/hero-banner";

function isOptionalUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "#") return true;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export type HeroBannerFormErrors = {
  slides?: string;
};

function validateSlide(
  slide: HeroBannerSlideFormValues,
  index: number,
): string | null {
  const label = `Slide ${index + 1}`;

  if (slide.layoutType === "FULL_WIDTH") {
    if (!slide.mobileImage.url.trim() || !isHttpUrl(slide.mobileImage.url)) {
      return `${label}: mobile image is required`;
    }
    if (!slide.desktopImage.url.trim() || !isHttpUrl(slide.desktopImage.url)) {
      return `${label}: laptop image is required`;
    }
    if (!isOptionalUrl(slide.buttonUrl)) {
      return `${label}: invalid image click URL`;
    }
    return null;
  }

  if (slide.layoutType === "DOCTOR_BANNER") {
    if (!slide.desktopImage.url.trim() || !isHttpUrl(slide.desktopImage.url)) {
      return `${label}: background image is required`;
    }
    if (!slide.mainHeading.trim()) {
      return `${label}: main heading is required`;
    }
    if (slide.mainHeading.trim().length > 300) {
      return `${label}: main heading must be 300 characters or fewer`;
    }
    if (!slide.buttonLabel.trim()) {
      return `${label}: button label is required`;
    }
    if (!isOptionalUrl(slide.buttonUrl)) {
      return `${label}: invalid button URL`;
    }
    if (!slide.leftImage.url.trim() || !isHttpUrl(slide.leftImage.url)) {
      return `${label}: card 2 image is required`;
    }
    if (!slide.secondaryHeading.trim()) {
      return `${label}: card 3 heading is required`;
    }
    if (!slide.callNumber.trim()) {
      return `${label}: call number is required`;
    }
    return null;
  }

  if (!slide.mainHeading.trim()) {
    return `${label}: main heading is required`;
  }
  if (slide.mainHeading.trim().length > 300) {
    return `${label}: main heading must be 300 characters or fewer`;
  }
  if (!slide.buttonLabel.trim()) {
    return `${label}: button label is required`;
  }
  if (!isOptionalUrl(slide.buttonUrl)) {
    return `${label}: invalid button URL`;
  }

  if (slide.layoutType === "SPLIT_DUAL") {
    if (!slide.button2Label.trim()) {
      return `${label}: secondary button label is required`;
    }
    if (!isOptionalUrl(slide.button2Url)) {
      return `${label}: invalid secondary button URL`;
    }
    if (!slide.leftImage.url.trim() || !isHttpUrl(slide.leftImage.url)) {
      return `${label}: left side image URL is required`;
    }
    if (!slide.rightImage.url.trim() || !isHttpUrl(slide.rightImage.url)) {
      return `${label}: right side image URL is required`;
    }
    if (!isOptionalUrl(slide.leftImageClickUrl)) {
      return `${label}: invalid left image click URL`;
    }
    if (!isOptionalUrl(slide.rightImageClickUrl)) {
      return `${label}: invalid right image click URL`;
    }
  }

  if (slide.layoutType === "MULTI_IMAGE") {
    const filled = slide.gridImages.filter((image) => image.image.url.trim());
    if (filled.length < 4 || filled.length > 6) {
      return `${label}: add 4–6 associate brand images`;
    }
    for (const [gridIndex, image] of filled.entries()) {
      if (!isHttpUrl(image.image.url)) {
        return `${label}: grid image ${gridIndex + 1} URL is invalid`;
      }
      if (!isOptionalUrl(image.clickUrl)) {
        return `${label}: invalid grid image ${gridIndex + 1} click URL`;
      }
    }
  }

  return null;
}

export function validateHeroBannerForm(
  values: HeroBannerFormValues,
):
  | { success: true; data: HeroBannerFormValues }
  | { success: false; errors: HeroBannerFormErrors } {
  for (const [index, slide] of values.slides.entries()) {
    const error = validateSlide(slide, index);
    if (error) {
      return { success: false, errors: { slides: error } };
    }
  }

  return { success: true, data: values };
}

export function toHeroBannerPayload(
  values: HeroBannerFormValues,
): HeroBannerConfigPayload {
  return {
    slides: values.slides.map((slide, index) => {
      const isFullWidth = slide.layoutType === "FULL_WIDTH";
      const isSplit = slide.layoutType === "SPLIT_DUAL";
      const isDoctor = slide.layoutType === "DOCTOR_BANNER";
      const hasSecondaryButton = isSplit || slide.layoutType === "MULTI_IMAGE";
      const isMulti = slide.layoutType === "MULTI_IMAGE";
      const keepsCopy = !isFullWidth;

      return {
        layoutType: slide.layoutType,
        order: Number.isFinite(slide.order) ? slide.order : index,
        active: slide.active,
        mobileImageUrl:
          isFullWidth || isDoctor ? slide.mobileImage.url.trim() : "",
        mobileImagePublicId:
          isFullWidth || isDoctor ? slide.mobileImage.publicId.trim() : "",
        desktopImageUrl:
          isFullWidth || isDoctor ? slide.desktopImage.url.trim() : "",
        desktopImagePublicId:
          isFullWidth || isDoctor ? slide.desktopImage.publicId.trim() : "",
        miniHeading: keepsCopy ? slide.miniHeading.trim() : "",
        mainHeading: keepsCopy ? slide.mainHeading.trim() : "",
        description: keepsCopy ? slide.description.trim() : "",
        buttonLabel: keepsCopy ? slide.buttonLabel.trim() : "",
        // FULL_WIDTH stores the banner image click destination in buttonUrl.
        buttonUrl: slide.buttonUrl.trim(),
        button2Label: hasSecondaryButton ? slide.button2Label.trim() : "",
        button2Url: hasSecondaryButton ? slide.button2Url.trim() : "",
        leftImageUrl:
          isSplit || isDoctor ? slide.leftImage.url.trim() : "",
        leftImagePublicId:
          isSplit || isDoctor ? slide.leftImage.publicId.trim() : "",
        leftImageClickUrl: isSplit ? slide.leftImageClickUrl.trim() : "",
        rightImageUrl: isSplit ? slide.rightImage.url.trim() : "",
        rightImagePublicId: isSplit ? slide.rightImage.publicId.trim() : "",
        rightImageClickUrl: isSplit ? slide.rightImageClickUrl.trim() : "",
        secondaryHeading: isDoctor ? slide.secondaryHeading.trim() : "",
        secondaryDescription: isDoctor ? slide.secondaryDescription.trim() : "",
        callNumber: isDoctor ? slide.callNumber.trim() : "",
        gridImages: isMulti
          ? slide.gridImages
              .filter((image) => image.image.url.trim())
              .map((image, imageIndex) => ({
                imageUrl: image.image.url.trim(),
                imagePublicId: image.image.publicId.trim(),
                alt: image.alt.trim(),
                clickUrl: image.clickUrl.trim(),
                order: imageIndex,
              }))
          : [],
      };
    }),
  };
}
