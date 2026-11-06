import { adminData, jsonBody, uploadMedia } from "@/services/api/admin-fetch";
import type { PopupBannerConfigDto, PopupBannerConfigPayload } from "@/types/admin/popup-banner";

export async function fetchPopupBannerConfig(): Promise<PopupBannerConfigDto> {
  return adminData<PopupBannerConfigDto>("/api/admin/banners/popup");
}

export async function upsertPopupBannerConfig(
  body: PopupBannerConfigPayload,
): Promise<PopupBannerConfigDto> {
  return adminData<PopupBannerConfigDto>("/api/admin/banners/popup", jsonBody("PUT", body));
}

export async function uploadPopupBannerImage(
  file: File,
  _entityId?: string | null,
): Promise<{ url: string; publicId: string }> {
  return uploadMedia(file, "single-image");
}
