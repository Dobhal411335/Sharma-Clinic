import type {
  FooterColumnFormValues,
  FooterConfigDto,
  FooterLinkFormValues,
  ManageFooterFormValues,
} from "@/types/admin/manage-footer";

export function createEmptyLink(): FooterLinkFormValues {
  return {
    label: "",
    url: "/",
    order: "",
    active: true,
  };
}

export function createEmptyColumn(): FooterColumnFormValues {
  return {
    title: "",
    order: "",
    active: true,
    links: [createEmptyLink()],
  };
}

export function createEmptyFormValues(): ManageFooterFormValues {
  return {
    thankYou: "",
    description: "",
    columns: [],
  };
}

export function dtoToFormValues(dto: FooterConfigDto): ManageFooterFormValues {
  return {
    thankYou: dto.thankYou ?? "",
    description: dto.description ?? "",
    columns: (dto.columns ?? []).map((column) => ({
      title: column.title,
      order: String(column.order ?? ""),
      active: column.active,
      links: (column.links ?? []).map((link) => ({
        label: link.label,
        url: link.url,
        order: String(link.order ?? ""),
        active: link.active,
      })),
    })),
  };
}
