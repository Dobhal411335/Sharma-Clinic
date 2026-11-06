import { adminData, jsonBody, uploadMedia } from "@/services/api/admin-fetch";
import type { BlogCreatePayload, BlogDto, BlogUpdatePayload } from "@/types/admin/blog";

const base = "/api/admin/blog";

export async function fetchBlogs(): Promise<BlogDto[]> {
  return adminData<BlogDto[]>(base);
}

export async function fetchBlog(blogId: string): Promise<BlogDto> {
  return adminData<BlogDto>(`${base}?id=${encodeURIComponent(blogId)}`);
}

export async function createBlog(body: BlogCreatePayload): Promise<BlogDto> {
  return adminData<BlogDto>(base, jsonBody("POST", body));
}

export async function updateBlog(
  blogId: string,
  body: BlogUpdatePayload,
): Promise<BlogDto> {
  return adminData<BlogDto>(`${base}?id=${encodeURIComponent(blogId)}`, jsonBody("PUT", body));
}

export async function patchBlog(
  blogId: string,
  body: { name?: string; active?: boolean },
): Promise<BlogDto> {
  return adminData<BlogDto>(`${base}?id=${encodeURIComponent(blogId)}`, jsonBody("PATCH", body));
}

export async function deleteBlog(blogId: string): Promise<void> {
  await adminData(`${base}?id=${encodeURIComponent(blogId)}`, { method: "DELETE" });
}

export async function uploadBlogImage(
  file: File,
  _entityId?: string | null,
): Promise<{ url: string; publicId: string }> {
  return uploadMedia(file, "single-image");
}
