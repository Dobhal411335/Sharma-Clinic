import { z } from "zod";

import type {
  GalleryItemFormValues,
  GalleryItemPayload,
} from "@/types/admin/gallery";

/** Relative paths, hash links, absolute http(s) URLs, or empty. */
function isOptionalUrl(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "#") return true;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const galleryItemFormSchema = z
  .object({
    mediaType: z.enum(["image", "video", "text_card"]),
    mediaUrl: z.string().trim().max(2000),
    mediaPublicId: z.string().trim().max(500),
    clickUrl: z.string().trim().max(2000),
    heading: z.string().trim().max(300),
    description: z.string().trim().max(4000),
    buttonLabel: z.string().trim().max(100),
    buttonUrl: z.string().trim().max(2000),
    active: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.mediaType === "image" || value.mediaType === "video") {
      if (!value.mediaUrl || !z.string().url().safeParse(value.mediaUrl).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mediaUrl"],
          message: "Please upload media",
        });
      }
      if (!isOptionalUrl(value.clickUrl)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["clickUrl"],
          message: "Enter a valid path or http(s) URL",
        });
      }
      return;
    }

    if (!value.heading) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["heading"],
        message: "Heading is required",
      });
    }
    if (!value.description) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["description"],
        message: "Description is required",
      });
    }
    if (!value.buttonLabel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["buttonLabel"],
        message: "Button label is required",
      });
    }
    if (!value.buttonUrl.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["buttonUrl"],
        message: "Button URL is required",
      });
    } else if (!isOptionalUrl(value.buttonUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["buttonUrl"],
        message: "Enter a valid path or http(s) URL",
      });
    }
  });

export type GalleryItemFormErrors = Partial<
  Record<
    | "mediaType"
    | "mediaUrl"
    | "clickUrl"
    | "heading"
    | "description"
    | "buttonLabel"
    | "buttonUrl"
    | "active",
    string
  >
>;

export function validateGalleryItemForm(
  values: GalleryItemFormValues,
):
  | { success: true; data: GalleryItemFormValues }
  | { success: false; errors: GalleryItemFormErrors } {
  const result = galleryItemFormSchema.safeParse(values);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        mediaType: fieldErrors.mediaType?.[0],
        mediaUrl: fieldErrors.mediaUrl?.[0],
        clickUrl: fieldErrors.clickUrl?.[0],
        heading: fieldErrors.heading?.[0],
        description: fieldErrors.description?.[0],
        buttonLabel: fieldErrors.buttonLabel?.[0],
        buttonUrl: fieldErrors.buttonUrl?.[0],
        active: fieldErrors.active?.[0],
      },
    };
  }
  return { success: true, data: result.data };
}

export function toGalleryItemPayload(
  values: GalleryItemFormValues,
): GalleryItemPayload {
  if (values.mediaType === "text_card") {
    return {
      mediaType: "text_card",
      mediaUrl: "",
      mediaPublicId: "",
      clickUrl: "",
      heading: values.heading.trim(),
      description: values.description.trim(),
      buttonLabel: values.buttonLabel.trim(),
      buttonUrl: values.buttonUrl.trim(),
      active: values.active,
    };
  }

  return {
    mediaType: values.mediaType,
    mediaUrl: values.mediaUrl.trim(),
    mediaPublicId: values.mediaPublicId.trim(),
    clickUrl: values.clickUrl.trim(),
    heading: "",
    description: "",
    buttonLabel: "",
    buttonUrl: "",
    active: values.active,
  };
}
