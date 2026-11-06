import { z } from "zod";

import type {
  CustomerReviewFormValues,
  CustomerReviewPayload,
} from "@/types/admin/customer-review";

export const customerReviewFormSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required").max(120),
  designation: z.string().trim().min(1, "Designation is required").max(160),
  description: z
    .string()
    .trim()
    .min(1, "Review description is required")
    .max(2000),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  imageUrl: z.string().trim().url("Please upload a customer image"),
  imagePublicId: z.string().trim().max(500),
  active: z.boolean(),
  order: z.string().trim(),
});

export type CustomerReviewFormErrors = Partial<
  Record<
    | "customerName"
    | "designation"
    | "description"
    | "rating"
    | "imageUrl"
    | "order"
    | "active",
    string
  >
>;

export function validateCustomerReviewForm(
  values: CustomerReviewFormValues,
):
  | { success: true; data: CustomerReviewFormValues }
  | { success: false; errors: CustomerReviewFormErrors } {
  const result = customerReviewFormSchema.safeParse(values);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        customerName: fieldErrors.customerName?.[0],
        designation: fieldErrors.designation?.[0],
        description: fieldErrors.description?.[0],
        rating: fieldErrors.rating?.[0],
        imageUrl: fieldErrors.imageUrl?.[0],
        order: fieldErrors.order?.[0],
        active: fieldErrors.active?.[0],
      },
    };
  }
  return { success: true, data: result.data };
}

export function toCustomerReviewPayload(
  values: CustomerReviewFormValues,
  fallbackOrder: number,
): CustomerReviewPayload {
  const order =
    values.order.trim() === "" ? fallbackOrder : Number(values.order);

  return {
    customerName: values.customerName.trim(),
    designation: values.designation.trim(),
    description: values.description.trim(),
    rating: values.rating,
    imageUrl: values.imageUrl.trim(),
    imagePublicId: values.imagePublicId.trim(),
    active: values.active,
    order: Number.isFinite(order) ? order : fallbackOrder,
  };
}
