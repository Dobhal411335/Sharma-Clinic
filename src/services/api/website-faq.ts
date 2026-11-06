import { adminData, jsonBody } from "@/services/api/admin-fetch";
import type { FaqConfigDto, FaqConfigPayload } from "@/types/admin/website-faq";

export async function fetchFaqConfig(): Promise<FaqConfigDto> {
  return adminData<FaqConfigDto>("/api/admin/faq");
}

export async function upsertFaqConfig(
  body: FaqConfigPayload,
): Promise<FaqConfigDto> {
  return adminData<FaqConfigDto>("/api/admin/faq", jsonBody("PUT", body));
}
