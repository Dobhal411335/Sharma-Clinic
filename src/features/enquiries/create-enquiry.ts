import { publicApiFetch } from "@/lib/api/client";
import type { EnquiryCreatePayload } from "@/types/enquiry";

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

const STOREFRONT_SITE_CODE = "IN" as const;

export async function createContactEnquiry(payload: EnquiryCreatePayload): Promise<void> {
  await publicApiFetch<ApiSuccess<unknown>>(
    `/sites/${STOREFRONT_SITE_CODE}/enquiries`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
