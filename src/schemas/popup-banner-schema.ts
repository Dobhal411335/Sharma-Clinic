import type {
  PopupBannerConfigPayload,
  PopupBannerFormValues,
} from "@/types/admin/popup-banner";

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

export type PopupBannerFormErrors = {
  image?: string;
  miniHeading?: string;
  heading?: string;
  subDescription?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  active?: string;
};

export function validatePopupBannerForm(
  values: PopupBannerFormValues,
):
  | { success: true; data: PopupBannerFormValues }
  | { success: false; errors: PopupBannerFormErrors } {
  const errors: PopupBannerFormErrors = {};

  if (values.miniHeading.trim().length > 100) {
    errors.miniHeading = "Mini heading must be 100 characters or fewer";
  }
  if (values.heading.trim().length > 300) {
    errors.heading = "Heading must be 300 characters or fewer";
  }
  if (values.subDescription.trim().length > 2000) {
    errors.subDescription = "Sub description must be 2000 characters or fewer";
  }
  if (values.buttonLabel.trim().length > 100) {
    errors.buttonLabel = "Button label must be 100 characters or fewer";
  }
  if (!isOptionalUrl(values.buttonUrl)) {
    errors.buttonUrl = "Enter a path, hash link, or absolute URL";
  }

  if (values.active) {
    if (!values.image.url.trim()) {
      errors.image = "Image is required when the popup is active";
    }
    if (!values.heading.trim()) {
      errors.heading = "Heading is required when the popup is active";
    }
    if (!values.buttonLabel.trim()) {
      errors.buttonLabel = "Button label is required when the popup is active";
    }
    if (!values.buttonUrl.trim()) {
      errors.buttonUrl = "Button URL is required when the popup is active";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: values };
}

export function toPopupBannerPayload(
  values: PopupBannerFormValues,
): PopupBannerConfigPayload {
  return {
    imageUrl: values.image.url.trim(),
    imagePublicId: values.image.publicId.trim(),
    miniHeading: values.miniHeading.trim(),
    heading: values.heading.trim(),
    subDescription: values.subDescription.trim(),
    buttonLabel: values.buttonLabel.trim(),
    buttonUrl: values.buttonUrl.trim(),
    active: values.active,
  };
}
