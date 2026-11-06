import { adminData, jsonBody, uploadMedia } from "@/services/api/admin-fetch";
import type { GalleryItemDto, GalleryItemPayload } from "@/types/admin/gallery";

const base = "/api/admin/gallery";

export async function fetchGalleryItems(): Promise<GalleryItemDto[]> {
  return adminData<GalleryItemDto[]>(base);
}

export async function createGalleryItem(
  body: GalleryItemPayload,
): Promise<GalleryItemDto> {
  return adminData<GalleryItemDto>(base, jsonBody("POST", body));
}

export async function updateGalleryItem(
  itemId: string,
  body: GalleryItemPayload,
): Promise<GalleryItemDto> {
  return adminData<GalleryItemDto>(`${base}?id=${encodeURIComponent(itemId)}`, jsonBody("PUT", body));
}

export async function patchGalleryItem(
  itemId: string,
  body: { active: boolean },
): Promise<GalleryItemDto> {
  return adminData<GalleryItemDto>(`${base}?id=${encodeURIComponent(itemId)}`, jsonBody("PATCH", body));
}

export async function deleteGalleryItem(itemId: string): Promise<void> {
  await adminData(`${base}?id=${encodeURIComponent(itemId)}`, { method: "DELETE" });
}

export async function uploadGalleryImage(
  file: File,
  _entityId?: string | null,
): Promise<{ url: string; publicId: string }> {
  return uploadMedia(file, "single-image");
}

export async function uploadGalleryVideo(
  file: File,
  _entityId?: string | null,
): Promise<{ url: string; publicId: string }> {
  return uploadMedia(file, "single-video");
}
