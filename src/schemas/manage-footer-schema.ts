import { z } from "zod";

import type {
  FooterConfigPayload,
  ManageFooterFormValues,
} from "@/types/admin/manage-footer";

const footerUrlSchema = z
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

export const manageFooterFormSchema = z.object({
  thankYou: z.string().trim().max(300),
  description: z.string().trim().max(5000),
  columns: z.array(
    z.object({
      title: z.string().trim().max(200),
      order: z.string().trim(),
      active: z.boolean(),
      links: z.array(
        z.object({
          label: z.string().trim().max(200),
          url: footerUrlSchema,
          order: z.string().trim(),
          active: z.boolean(),
        }),
      ),
    }),
  ),
});

export type ManageFooterFormErrors = {
  thankYou?: string;
  description?: string;
  columns?: string;
};

export function validateManageFooterForm(
  values: ManageFooterFormValues,
):
  | { success: true; data: ManageFooterFormValues }
  | { success: false; errors: ManageFooterFormErrors } {
  const result = manageFooterFormSchema.safeParse(values);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        thankYou: fieldErrors.thankYou?.[0],
        description: fieldErrors.description?.[0],
        columns: fieldErrors.columns?.[0],
      },
    };
  }

  for (const [columnIndex, column] of values.columns.entries()) {
    if (!column.title.trim()) {
      return {
        success: false,
        errors: { columns: `Column ${columnIndex + 1} needs a title` },
      };
    }
    for (const [linkIndex, link] of column.links.entries()) {
      if (!link.label.trim()) {
        return {
          success: false,
          errors: {
            columns: `Column ${columnIndex + 1}, link ${linkIndex + 1} needs a label`,
          },
        };
      }
    }
  }

  return { success: true, data: result.data };
}

export function toFooterConfigPayload(
  values: ManageFooterFormValues,
): FooterConfigPayload {
  return {
    thankYou: values.thankYou.trim(),
    description: values.description.trim(),
    columns: values.columns
      .filter((column) => column.title.trim())
      .map((column, columnIndex) => {
        const order =
          column.order.trim() === "" ? columnIndex + 1 : Number(column.order);
        return {
          title: column.title.trim(),
          active: column.active,
          order: Number.isFinite(order) ? order : columnIndex + 1,
          links: column.links
            .filter((link) => link.label.trim())
            .map((link, linkIndex) => {
              const linkOrder =
                link.order.trim() === "" ? linkIndex + 1 : Number(link.order);
              return {
                label: link.label.trim(),
                url: link.url.trim() || "#",
                active: link.active,
                order: Number.isFinite(linkOrder) ? linkOrder : linkIndex + 1,
              };
            }),
        };
      }),
  };
}
