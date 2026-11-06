import { adminData, jsonBody, uploadMedia } from "@/services/api/admin-fetch";
import type { AboutUsBannerConfigDto, AboutUsBannerConfigPayload } from "@/types/admin/about-us-banner";

export async function fetchAboutUsBannerConfig(): Promise<AboutUsBannerConfigDto> {
  return adminData<AboutUsBannerConfigDto>("/api/admin/banners/about-us");
}

export async function upsertAboutUsBannerConfig(
  body: AboutUsBannerConfigPayload,
): Promise<AboutUsBannerConfigDto> {
  return adminData<AboutUsBannerConfigDto>("/api/admin/banners/about-us", jsonBody("PUT", body));
}

export async function uploadAboutUsImage(
  file: File,
  _entityId?: string | null,
): Promise<{ url: string; publicId: string }> {
  return uploadMedia(file, "single-image");
}
