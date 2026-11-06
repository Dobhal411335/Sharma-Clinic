import type {
  TopAdvertisementConfigDto,
  TopAdvertisementFormValues,
  TopAdvertisementItemFormValues,
} from "@/types/admin/top-advertisement";

export function createEmptyItem(
  extras?: Partial<TopAdvertisementItemFormValues>,
): TopAdvertisementItemFormValues {
  return {
    text: "",
    url: "",
    active: true,
    ...extras,
  };
}

export function createEmptyFormValues(): TopAdvertisementFormValues {
  return {
    announcements: [],
    utilityItems: [],
    benefits: [],
  };
}

function mapItems(
  items: TopAdvertisementConfigDto["announcements"],
): TopAdvertisementItemFormValues[] {
  return (items ?? []).map((item) => ({
    text: item.text ?? "",
    url: item.url ?? "",
    active: item.active,
  }));
}

export function dtoToFormValues(
  dto: TopAdvertisementConfigDto,
): TopAdvertisementFormValues {
  return {
    announcements: mapItems(dto.announcements),
    utilityItems: mapItems(dto.utilityItems),
    benefits: mapItems(dto.benefits),
  };
}
