import { z } from "zod";

import type { FaqConfigPayload, WebsiteFaqFormValues } from "@/types/admin/website-faq";

export const websiteFaqFormSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string().trim().max(200),
      order: z.string().trim(),
      active: z.boolean(),
      items: z.array(
        z.object({
          question: z.string().trim().max(300),
          answer: z.string().trim().max(5000),
          showOnLanding: z.boolean(),
          order: z.string().trim(),
          active: z.boolean(),
        }),
      ),
    }),
  ),
});

export type WebsiteFaqFormErrors = {
  sections?: string;
};

export function validateWebsiteFaqForm(
  values: WebsiteFaqFormValues,
):
  | { success: true; data: WebsiteFaqFormValues }
  | { success: false; errors: WebsiteFaqFormErrors } {
  const result = websiteFaqFormSchema.safeParse(values);
  if (!result.success) {
    return {
      success: false,
      errors: { sections: result.error.flatten().fieldErrors.sections?.[0] },
    };
  }

  for (const [sectionIndex, section] of values.sections.entries()) {
    if (!section.title.trim()) {
      return {
        success: false,
        errors: { sections: `Section ${sectionIndex + 1} needs a heading` },
      };
    }
    for (const [itemIndex, item] of section.items.entries()) {
      if (!item.question.trim()) {
        return {
          success: false,
          errors: {
            sections: `Section ${sectionIndex + 1}, question ${itemIndex + 1} needs a heading`,
          },
        };
      }
      if (!item.answer.trim()) {
        return {
          success: false,
          errors: {
            sections: `Section ${sectionIndex + 1}, question ${itemIndex + 1} needs a description`,
          },
        };
      }
    }
  }

  return { success: true, data: result.data };
}

export function toFaqConfigPayload(values: WebsiteFaqFormValues): FaqConfigPayload {
  return {
    sections: values.sections
      .filter((section) => section.title.trim())
      .map((section, sectionIndex) => {
        const order =
          section.order.trim() === "" ? sectionIndex + 1 : Number(section.order);
        return {
          title: section.title.trim(),
          active: section.active,
          order: Number.isFinite(order) ? order : sectionIndex + 1,
          items: section.items
            .filter((item) => item.question.trim() && item.answer.trim())
            .map((item, itemIndex) => {
              const itemOrder =
                item.order.trim() === "" ? itemIndex + 1 : Number(item.order);
              return {
                question: item.question.trim(),
                answer: item.answer.trim(),
                showOnLanding: item.showOnLanding,
                active: item.active,
                order: Number.isFinite(itemOrder) ? itemOrder : itemIndex + 1,
              };
            }),
        };
      }),
  };
}
