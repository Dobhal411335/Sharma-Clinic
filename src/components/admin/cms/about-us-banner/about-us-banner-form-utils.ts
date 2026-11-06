import type {
  AboutUsAboutCardFormValues,
  AboutUsBannerConfigDto,
  AboutUsBannerFormValues,
  AboutUsHighlightItemFormValues,
  AboutUsServiceFormValues,
  AboutUsTextSlideFormValues,
} from "@/types/admin/about-us-banner";

export function createEmptyAboutCard(): AboutUsAboutCardFormValues {
  return {
    image: { url: "", publicId: "" },
    label: "About us",
    heading: "",
    description: "",
    buttonLabel: "Read more about us",
    buttonUrl: "/about",
    active: true,
  };
}

export function createEmptyHighlightItem(): AboutUsHighlightItemFormValues {
  return {
    image: { url: "", publicId: "" },
    heading: "",
    buttonLabel: "Read more",
    buttonUrl: "",
    active: true,
  };
}

export function createEmptyTextSlide(): AboutUsTextSlideFormValues {
  return {
    heading: "",
    subheading: "",
    active: true,
  };
}

export function createEmptyService(): AboutUsServiceFormValues {
  return {
    image: { url: "", publicId: "" },
    buttonLabel: "",
    heading: "",
    description: "",
    highlights: [{ text: "" }],
    doctorImage: { url: "", publicId: "" },
    doctorName: "",
    doctorDesignation: "",
    doctorButtonLabel: "Book an appointment",
    doctorButtonUrl: "/appointments",
    active: true,
  };
}

export function createEmptyFormValues(): AboutUsBannerFormValues {
  return {
    promoLabel: "",
    promoHeading: "",
    promoDescription: "",
    promoSubheading: "",
    promoButtonLabel: "",
    promoButtonUrl: "",
    servicesHeading: "",
    servicesViewAllLabel: "View all services",
    servicesViewAllUrl: "/services",
    aboutCards: [],
    highlightItems: [],
    textSlides: [],
    services: [],
  };
}

export function dtoToFormValues(dto: AboutUsBannerConfigDto): AboutUsBannerFormValues {
  return {
    promoLabel: dto.promoLabel ?? "",
    promoHeading: dto.promoHeading ?? "",
    promoDescription: dto.promoDescription ?? "",
    promoSubheading: dto.promoSubheading ?? "",
    promoButtonLabel: dto.promoButtonLabel ?? "",
    promoButtonUrl: dto.promoButtonUrl ?? "",
    servicesHeading: dto.servicesHeading ?? "",
    servicesViewAllLabel: dto.servicesViewAllLabel ?? "View all services",
    servicesViewAllUrl: dto.servicesViewAllUrl ?? "/services",
    aboutCards: (dto.aboutCards || []).map((card) => ({
      image: {
        url: card.imageUrl ?? "",
        publicId: card.imagePublicId ?? "",
      },
      label: card.label ?? "",
      heading: card.heading ?? "",
      description: card.description ?? "",
      buttonLabel: card.buttonLabel ?? "",
      buttonUrl: card.buttonUrl ?? "",
      active: card.active ?? true,
    })),
    highlightItems: (dto.highlightItems || []).map((item) => ({
      image: {
        url: item.imageUrl ?? "",
        publicId: item.imagePublicId ?? "",
      },
      heading: item.heading ?? "",
      buttonLabel: item.buttonLabel ?? "",
      buttonUrl: item.buttonUrl ?? "",
      active: item.active ?? true,
    })),
    textSlides: (dto.textSlides || []).map((slide) => ({
      heading: slide.heading ?? "",
      subheading: slide.subheading ?? "",
      active: slide.active ?? true,
    })),
    services: (dto.services || []).map((service) => ({
      image: { url: service.imageUrl ?? "", publicId: service.imagePublicId ?? "" },
      buttonLabel: service.buttonLabel ?? "",
      heading: service.heading ?? "",
      description: service.description ?? "",
      highlights: (service.highlights || []).map((highlight) => ({ text: highlight.text ?? "" })),
      doctorImage: { url: service.doctorImageUrl ?? "", publicId: service.doctorImagePublicId ?? "" },
      doctorName: service.doctorName ?? "",
      doctorDesignation: service.doctorDesignation ?? "",
      doctorButtonLabel: service.doctorButtonLabel ?? "",
      doctorButtonUrl: service.doctorButtonUrl ?? "",
      active: service.active ?? true,
    })),
  };
}
