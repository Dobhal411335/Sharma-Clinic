import { adminData, jsonBody, uploadMedia } from "@/services/api/admin-fetch";
import type {
  WebpageContentUpdatePayload,
  WebpageCreatePayload,
  WebpageDto,
  WebpageMetaPatchPayload,
} from "@/types/admin/webpages";

const base = "/api/admin/webpages";

export async function fetchWebpages(): Promise<WebpageDto[]> {
  return adminData<WebpageDto[]>(base);
}

export async function fetchWebpage(webpageId: string): Promise<WebpageDto> {
  return adminData<WebpageDto>(`${base}?id=${encodeURIComponent(webpageId)}`);
}

export async function createWebpage(
  body: WebpageCreatePayload,
): Promise<WebpageDto> {
  return adminData<WebpageDto>(base, jsonBody("POST", body));
}

export async function updateWebpageContent(
  webpageId: string,
  body: WebpageContentUpdatePayload,
): Promise<WebpageDto> {
  return adminData<WebpageDto>(`${base}?id=${encodeURIComponent(webpageId)}`, jsonBody("PUT", body));
}

export async function patchWebpageMeta(
  webpageId: string,
  body: WebpageMetaPatchPayload,
): Promise<WebpageDto> {
  return adminData<WebpageDto>(`${base}?id=${encodeURIComponent(webpageId)}`, jsonBody("PATCH", body));
}

export async function deleteWebpage(webpageId: string): Promise<void> {
  await adminData(`${base}?id=${encodeURIComponent(webpageId)}`, { method: "DELETE" });
}

export async function uploadWebpageImage(
  file: File,
  _entityId?: string | null,
): Promise<{ url: string; key: string }> {
  const uploaded = await uploadMedia(file, "single-image");
  return { url: uploaded.url, key: uploaded.publicId };
}
