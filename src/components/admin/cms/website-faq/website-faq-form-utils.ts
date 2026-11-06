import type {
  FaqConfigDto,
  FaqItemFormValues,
  FaqSectionFormValues,
  WebsiteFaqFormValues,
} from "@/types/admin/website-faq";

export function createEmptyItem(): FaqItemFormValues {
  return {
    question: "",
    answer: "",
    showOnLanding: false,
    order: "",
    active: true,
  };
}

export function createEmptySection(): FaqSectionFormValues {
  return {
    title: "",
    order: "",
    active: true,
    items: [createEmptyItem()],
  };
}

export function createEmptyFormValues(): WebsiteFaqFormValues {
  return {
    sections: [],
  };
}

export function dtoToFormValues(dto: FaqConfigDto): WebsiteFaqFormValues {
  return {
    sections: (dto.sections ?? []).map((section) => ({
      title: section.title,
      order: String(section.order ?? ""),
      active: section.active,
      items: (section.items ?? []).map((item) => ({
        question: item.question,
        answer: item.answer,
        showOnLanding: item.showOnLanding,
        order: String(item.order ?? ""),
        active: item.active,
      })),
    })),
  };
}

export function moveItem<T>(list: T[], index: number, direction: "up" | "down"): T[] {
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= list.length) return list;
  const next = [...list];
  const current = next[index];
  const swap = next[nextIndex];
  if (!current || !swap) return list;
  next[index] = swap;
  next[nextIndex] = current;
  return next;
}
