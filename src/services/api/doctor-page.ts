import { adminData, jsonBody, uploadMedia } from "@/services/api/admin-fetch";
import type { DoctorPageConfigDto, DoctorPagePayload } from "@/types/admin/doctor-page";

export async function fetchDoctorPageConfig(): Promise<DoctorPageConfigDto> {
  return adminData<DoctorPageConfigDto>("/api/admin/doctors/page");
}

export async function upsertDoctorPageConfig(
  body: DoctorPagePayload,
): Promise<DoctorPageConfigDto> {
  return adminData<DoctorPageConfigDto>("/api/admin/doctors/page", jsonBody("PUT", body));
}

export async function uploadDoctorPageImage(
  file: File,
  _entityId?: string | null,
): Promise<{ url: string; publicId: string }> {
  return uploadMedia(file, "single-image");
}
