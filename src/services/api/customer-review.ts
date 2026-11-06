import { adminData, jsonBody, uploadMedia } from "@/services/api/admin-fetch";
import type { CustomerReviewDto, CustomerReviewPayload } from "@/types/admin/customer-review";

const base = "/api/admin/reviews";

export async function fetchCustomerReviews(): Promise<CustomerReviewDto[]> {
  return adminData<CustomerReviewDto[]>(base);
}

export async function createCustomerReview(
  body: CustomerReviewPayload,
): Promise<CustomerReviewDto> {
  return adminData<CustomerReviewDto>(base, jsonBody("POST", body));
}

export async function updateCustomerReview(
  reviewId: string,
  body: CustomerReviewPayload,
): Promise<CustomerReviewDto> {
  return adminData<CustomerReviewDto>(`${base}?id=${encodeURIComponent(reviewId)}`, jsonBody("PUT", body));
}

export async function patchCustomerReview(
  reviewId: string,
  body: { active?: boolean; order?: number },
): Promise<CustomerReviewDto> {
  return adminData<CustomerReviewDto>(
    `${base}?id=${encodeURIComponent(reviewId)}`,
    jsonBody("PATCH", body),
  );
}

export async function deleteCustomerReview(reviewId: string): Promise<void> {
  await adminData(`${base}?id=${encodeURIComponent(reviewId)}`, { method: "DELETE" });
}

export async function uploadCustomerReviewImage(
  file: File,
  _entityId?: string | null,
): Promise<{ url: string; publicId: string }> {
  return uploadMedia(file, "single-image");
}
