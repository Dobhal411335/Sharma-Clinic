import { adminData, jsonBody } from "@/services/api/admin-fetch";
import type { PromoBannerConfigDto, PromoBannerConfigPayload } from "@/types/admin/promo-collection-banners";

const path = "/api/admin/banners/promo-collection?section=promo";

export async function fetchPromoBannerConfig(): Promise<PromoBannerConfigDto> {
  return adminData<PromoBannerConfigDto>(path);
}

export async function upsertPromoBannerConfig(
  body: PromoBannerConfigPayload,
): Promise<PromoBannerConfigDto> {
  return adminData<PromoBannerConfigDto>(path, jsonBody("PUT", { ...body, section: "promo" }));
}
