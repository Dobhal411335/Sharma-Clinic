import { z } from "zod";

import type {
  TopAdvertisementConfigPayload,
  TopAdvertisementFormValues,
} from "@/types/admin/top-advertisement";

const optionalUrlSchema = z
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

const itemSchema = z.object({
  text: z.string().trim(),
  url: optionalUrlSchema,
  active: z.boolean(),
});

export const topAdvertisementFormSchema = z.object({
  announcements: z.array(
    itemSchema.extend({
      text: z.string().trim().max(500),
    }),
  ),
  utilityItems: z.array(
    itemSchema.extend({
      text: z.string().trim().max(300),
    }),
  ),
  benefits: z.array(
    itemSchema.extend({
      text: z.string().trim().max(200),
    }),
  ),
});

export type TopAdvertisementFormErrors = {
  announcements?: string;
  utilityItems?: string;
  benefits?: string;
};

export function validateTopAdvertisementForm(
  values: TopAdvertisementFormValues,
):
  | { success: true; data: TopAdvertisementFormValues }
  | { success: false; errors: TopAdvertisementFormErrors } {
  const result = topAdvertisementFormSchema.safeParse(values);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        announcements: fieldErrors.announcements?.[0],
        utilityItems: fieldErrors.utilityItems?.[0],
        benefits: fieldErrors.benefits?.[0],
      },
    };
  }

  for (const [index, item] of values.announcements.entries()) {
    if (!item.text.trim()) {
      return {
        success: false,
        errors: {
          announcements: `Announcement ${index + 1} needs text`,
        },
      };
    }
  }

  for (const [index, item] of values.utilityItems.entries()) {
    if (!item.text.trim()) {
      return {
        success: false,
        errors: {
          utilityItems: `Utility line ${index + 1} needs text`,
        },
      };
    }
  }

  for (const [index, item] of values.benefits.entries()) {
    if (!item.text.trim()) {
      return {
        success: false,
        errors: {
          benefits: `Benefit ${index + 1} needs a title`,
        },
      };
    }
  }

  return { success: true, data: values };
}

export function toTopAdvertisementPayload(
  values: TopAdvertisementFormValues,
): TopAdvertisementConfigPayload {
  return {
    announcements: values.announcements.map((item) => ({
      text: item.text.trim(),
      url: item.url.trim(),
      active: item.active,
    })),
    utilityItems: values.utilityItems.map((item) => ({
      text: item.text.trim(),
      url: item.url.trim(),
      active: item.active,
    })),
    benefits: values.benefits.map((item) => ({
      text: item.text.trim(),
      url: item.url.trim(),
      active: item.active,
    })),
  };
}
