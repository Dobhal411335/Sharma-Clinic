import { z } from "zod";

import type {
  NavbarSectionFormValues,
  NavbarSectionPayload,
} from "@/types/admin/manage-navbar";

const navUrlSchema = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (value) => {
      if (value === "" || value === "#") return true;
      if (value.startsWith("/") || value.startsWith("#")) return true;
      return z.string().url().safeParse(value).success;
    },
    { message: "URL must be a path, hash link, or absolute URL" },
  );

export const navbarSectionFormSchema = z.object({
  title: z.string().trim().min(1, "Navbar section title is required").max(200),
  description: z.string().trim().max(500).default(""),
  url: navUrlSchema,
  menuHeading: z.string().trim().max(300),
  menuDescription: z.string().trim().max(500),
  order: z.string().trim(),
  active: z.boolean(),
  subSections: z.array(
    z.object({
      title: z.string().trim().max(200),
      url: navUrlSchema,
      description: z.string().trim().max(500),
      order: z.string().trim(),
      active: z.boolean(),
    }),
  ),
});

export type NavbarSectionFormErrors = Partial<
  Record<"title" | "url" | "order" | "active" | "subSections", string>
>;

export function validateNavbarSectionForm(
  values: NavbarSectionFormValues,
):
  | { success: true; data: NavbarSectionFormValues }
  | { success: false; errors: NavbarSectionFormErrors } {
  const result = navbarSectionFormSchema.safeParse(values);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        title: fieldErrors.title?.[0],
        url: fieldErrors.url?.[0],
        order: fieldErrors.order?.[0],
        subSections: fieldErrors.subSections?.[0],
      },
    };
  }
  return { success: true, data: result.data };
}

export function toNavbarSectionPayload(
  values: NavbarSectionFormValues,
  fallbackOrder: number,
): NavbarSectionPayload {
  const order =
    values.order.trim() === "" ? fallbackOrder : Number(values.order);

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    url: values.url.trim() || "#",
    menuHeading: values.menuHeading.trim(),
    menuDescription: values.menuDescription.trim(),
    active: values.active,
    order: Number.isFinite(order) ? order : fallbackOrder,
    subSections: values.subSections
      .filter((item) => item.title.trim())
      .map((item, index) => {
        const subOrder =
          item.order.trim() === "" ? index + 1 : Number(item.order);
        return {
          title: item.title.trim(),
          url: item.url.trim() || "#",
          description: item.description.trim(),
          active: item.active,
          order: Number.isFinite(subOrder) ? subOrder : index + 1,
        };
      }),
  };
}
