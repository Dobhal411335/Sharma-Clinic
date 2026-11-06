import type {
  PopupBannerConfigDto,
  PopupBannerFormValues,
} from "@/types/admin/popup-banner";

export function createEmptyFormValues(): PopupBannerFormValues {
  return {
    image: { url: "", publicId: "" },
    miniHeading: "",
    heading: "",
    subDescription: "",
    buttonLabel: "",
    buttonUrl: "",
    active: false,
  };
}

export function dtoToFormValues(dto: PopupBannerConfigDto): PopupBannerFormValues {
  return {
    image: {
      url: dto.imageUrl || "",
      publicId: dto.imagePublicId || "",
    },
    miniHeading: dto.miniHeading || "",
    heading: dto.heading || "",
    subDescription: dto.subDescription || "",
    buttonLabel: dto.buttonLabel || "",
    buttonUrl: dto.buttonUrl || "",
    active: dto.active,
  };
}
