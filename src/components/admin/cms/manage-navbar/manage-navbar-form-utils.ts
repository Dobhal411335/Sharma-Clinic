import type {
  NavbarSectionDto,
  NavbarSectionFormValues,
  NavbarSubSectionFormValues,
} from "@/types/admin/manage-navbar";

export function createSubSectionFormValues(): NavbarSubSectionFormValues {
  return {
    title: "",
    url: "",
    description: "",
    order: "",
    active: true,
  };
}

export function createEmptyFormValues(): NavbarSectionFormValues {
  return {
    title: "",
    description: "",
    url: "#",
    menuHeading: "",
    menuDescription: "",
    order: "",
    active: true,
    subSections: [createSubSectionFormValues()],
  };
}

export function dtoToFormValues(section: NavbarSectionDto): NavbarSectionFormValues {
  return {
    title: section.title || "",
    description: section.description || "",
    url: section.url || "#",
    menuHeading: section.menuHeading || "",
    menuDescription: section.menuDescription || "",
    order: section.order != null ? String(section.order) : "",
    active: section.active ?? true,
    subSections:
      Array.isArray(section.subSections) && section.subSections.length > 0
        ? section.subSections.map((item) => ({
            title: item.title || "",
            url: item.url || "#",
            description: item.description || "",
            order: item.order != null ? String(item.order) : "",
            active: item.active ?? true,
          }))
        : [createSubSectionFormValues()],
  };
}
