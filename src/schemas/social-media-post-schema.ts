import { z } from "zod";

import type {
  SocialPostFormValues,
  SocialPostPayload,
} from "@/types/admin/social-media-post";

export const socialPostFormSchema = z.object({
  postType: z.enum(["instagram", "facebook"]),
  imageUrl: z.string().trim().url("Please upload a thumbnail image"),
  imagePublicId: z.string().trim().max(500),
  postUrl: z
    .string()
    .trim()
    .min(1, "Post URL is required")
    .url("Post URL must be a valid absolute URL"),
  active: z.boolean(),
  order: z.string().trim(),
});

export type SocialPostFormErrors = Partial<
  Record<"postType" | "imageUrl" | "postUrl" | "order" | "active", string>
>;

export function validateSocialPostForm(
  values: SocialPostFormValues,
):
  | { success: true; data: SocialPostFormValues }
  | { success: false; errors: SocialPostFormErrors } {
  const result = socialPostFormSchema.safeParse(values);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        postType: fieldErrors.postType?.[0],
        imageUrl: fieldErrors.imageUrl?.[0],
        postUrl: fieldErrors.postUrl?.[0],
        order: fieldErrors.order?.[0],
        active: fieldErrors.active?.[0],
      },
    };
  }
  return { success: true, data: result.data };
}

export function toSocialPostPayload(
  values: SocialPostFormValues,
  fallbackOrder: number,
): SocialPostPayload {
  const order =
    values.order.trim() === "" ? fallbackOrder : Number(values.order);

  return {
    postType: values.postType,
    imageUrl: values.imageUrl.trim(),
    imagePublicId: values.imagePublicId.trim(),
    postUrl: values.postUrl.trim(),
    active: values.active,
    order: Number.isFinite(order) ? order : fallbackOrder,
  };
}
