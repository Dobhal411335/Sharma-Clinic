import { adminData, jsonBody, uploadMedia } from "@/services/api/admin-fetch";
import type { HeroBannerConfigDto, HeroBannerConfigPayload } from "@/types/admin/hero-banner";

export async function fetchHeroBannerConfig(): Promise<HeroBannerConfigDto> {
  return adminData<HeroBannerConfigDto>("/api/admin/banners/hero");
}

export async function upsertHeroBannerConfig(
  body: HeroBannerConfigPayload,
): Promise<HeroBannerConfigDto> {
  return adminData<HeroBannerConfigDto>("/api/admin/banners/hero", jsonBody("PUT", body));
}

export async function uploadHeroImage(
  file: File,
  _entityId?: string | null,
): Promise<{ url: string; publicId: string }> {
  return uploadMedia(file, "single-image");
}
