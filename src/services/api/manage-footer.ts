import { adminData, jsonBody } from "@/services/api/admin-fetch";
import type { FooterConfigDto, FooterConfigPayload } from "@/types/admin/manage-footer";

export async function fetchFooterConfig(): Promise<FooterConfigDto> {
  return adminData<FooterConfigDto>("/api/admin/footer");
}

export async function upsertFooterConfig(
  body: FooterConfigPayload,
): Promise<FooterConfigDto> {
  return adminData<FooterConfigDto>("/api/admin/footer", jsonBody("PUT", body));
}
