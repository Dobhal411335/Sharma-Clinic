import { adminData, jsonBody, uploadMedia } from "@/services/api/admin-fetch";
import type {
  CollectionBannerConfigDto,
  CollectionBannerConfigPayload,
} from "@/types/admin/promo-collection-banners";

const path = "/api/admin/banners/promo-collection?section=collection";

export async function fetchCollectionBannerConfig(
): Promise<CollectionBannerConfigDto> {
  return adminData<CollectionBannerConfigDto>(path);
}

export async function upsertCollectionBannerConfig(
  body: CollectionBannerConfigPayload,
): Promise<CollectionBannerConfigDto> {
  return adminData<CollectionBannerConfigDto>(
    path,
    jsonBody("PUT", { ...body, section: "collection" }),
  );
}

export async function uploadCollectionBannerImage(
  file: File,
  _entityId?: string | null,
): Promise<{ url: string; publicId: string }> {
  return uploadMedia(file, "single-image");
}
