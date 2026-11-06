import { adminData, jsonBody, uploadMedia } from "@/services/api/admin-fetch";
import type { CompanyBasicInfoDto } from "@/types/admin/company-basic-info";

export async function fetchCompanyBasicInfo(): Promise<CompanyBasicInfoDto> {
  return adminData<CompanyBasicInfoDto>("/api/admin/company");
}

export async function upsertCompanyBasicInfo(
  body: Omit<CompanyBasicInfoDto, "id" | "siteCode" | "updatedAt">,
): Promise<CompanyBasicInfoDto> {
  return adminData<CompanyBasicInfoDto>("/api/admin/company", jsonBody("PUT", body));
}

export async function uploadCompanyLogo(
  file: File,
  _entityId?: string | null,
): Promise<{ url: string; publicId: string }> {
  return uploadMedia(file, "single-image");
}
