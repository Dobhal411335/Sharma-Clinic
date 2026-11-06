import type {
  CollectionBannerConfigDto,
  CollectionBannerFormValues,
  CollectionBannerItemFormValues,
  PromoBannerConfigDto,
  PromoBannerFormValues,
  PromoBannerItemFormValues,
} from "@/types/admin/promo-collection-banners";

export function newClientKey(): string {
  return `ck-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyPromoItem(): PromoBannerItemFormValues {
  return {
    clientKey: newClientKey(),
    miniHeading: "",
    heading: "",
    description: "",
    buttonLabel: "",
    buttonUrl: "",
    active: true,
  };
}

export function createEmptyPromoFormValues(): PromoBannerFormValues {
  return { items: [] };
}

export function promoDtoToFormValues(
  dto: PromoBannerConfigDto,
): PromoBannerFormValues {
  return {
    items: dto.items.map((item) => ({
      clientKey: item.id || newClientKey(),
      miniHeading: item.miniHeading || "",
      heading: item.heading || "",
      description: item.description || "",
      buttonLabel: item.buttonLabel || "",
      buttonUrl: item.buttonUrl,
      active: item.active,
    })),
  };
}

export function createEmptyCollectionItem(): CollectionBannerItemFormValues {
  return {
    clientKey: newClientKey(),
    image: { url: "", publicId: "" },
    title: "",
    description: "",
    buttonUrl: "",
    button1Label: "",
    button1Url: "",
    button2Label: "",
    button2Url: "",
    active: true,
  };
}

export function createEmptyCollectionFormValues(): CollectionBannerFormValues {
  return {
    sectionLabel: "Collection",
    sectionHeading: "Discover The Beauty In Our Gallery",
    items: [],
  };
}

export function collectionDtoToFormValues(
  dto: CollectionBannerConfigDto,
): CollectionBannerFormValues {
  return {
    sectionLabel: dto.sectionLabel || "Collection",
    sectionHeading:
      dto.sectionHeading || "Discover The Beauty In Our Gallery",
    items: dto.items.map((item) => ({
      clientKey: item.id || newClientKey(),
      image: { url: item.imageUrl, publicId: item.imagePublicId },
      title: item.title,
      description: item.description,
      buttonUrl: item.buttonUrl,
      button1Label: item.button1Label || "",
      button1Url: item.button1Url || "",
      button2Label: item.button2Label || "",
      button2Url: item.button2Url || "",
      active: item.active,
    })),
  };
}

export function moveItem<T>(items: T[], index: number, direction: "up" | "down"): T[] {
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  const [removed] = next.splice(index, 1);
  next.splice(target, 0, removed!);
  return next;
}
