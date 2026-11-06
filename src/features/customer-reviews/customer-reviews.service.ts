import { cache } from "react";

import type { CustomerReview } from "@/types/customer-reviews";

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

const STOREFRONT_SITE_CODE = "IN" as const;

function apiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) {
    return "";
  }
  return value.replace(/\/$/, "");
}

/**
 * Server-side fetch of active site-scoped customer reviews for the .in storefront.
 */
export const getCustomerReviews = cache(async (): Promise<CustomerReview[]> => {
  try {
    const { listItems } = await import("@/features/cms/store");
    const items = (await listItems("review")) as unknown as CustomerReview[];
    return items.filter(
      (item) =>
        item.active &&
        item.customerName &&
        item.description &&
        item.imageUrl &&
        item.rating >= 1 &&
        item.rating <= 5,
    );
  } catch {
    return [];
  }
});
