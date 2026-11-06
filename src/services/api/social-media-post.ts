import { adminData, jsonBody, uploadMedia } from "@/services/api/admin-fetch";
import type { SocialPostDto, SocialPostPayload } from "@/types/admin/social-media-post";

const base = "/api/admin/social-posts";

export async function fetchSocialPosts(
  postType?: SocialPostDto["postType"],
): Promise<SocialPostDto[]> {
  const items = await adminData<SocialPostDto[]>(base);
  if (!postType) return items;
  return items.filter((item) => item.postType === postType);
}

export async function createSocialPost(
  body: SocialPostPayload,
): Promise<SocialPostDto> {
  return adminData<SocialPostDto>(base, jsonBody("POST", body));
}

export async function updateSocialPost(
  postId: string,
  body: SocialPostPayload,
): Promise<SocialPostDto> {
  return adminData<SocialPostDto>(`${base}?id=${encodeURIComponent(postId)}`, jsonBody("PUT", body));
}

export async function patchSocialPost(
  postId: string,
  body: { active?: boolean; order?: number },
): Promise<SocialPostDto> {
  return adminData<SocialPostDto>(`${base}?id=${encodeURIComponent(postId)}`, jsonBody("PATCH", body));
}

export async function deleteSocialPost(postId: string): Promise<void> {
  await adminData(`${base}?id=${encodeURIComponent(postId)}`, { method: "DELETE" });
}

export async function uploadSocialPostImage(
  file: File,
  _entityId?: string | null,
): Promise<{ url: string; publicId: string }> {
  return uploadMedia(file, "single-image");
}
