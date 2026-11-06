import { adminData, jsonBody, uploadMedia } from "@/services/api/admin-fetch";
import type { DoctorProfileDto, DoctorProfilePayload } from "@/types/admin/doctor-profile";

const base = "/api/admin/doctors/profiles";

export async function fetchDoctorProfiles(): Promise<DoctorProfileDto[]> {
  return adminData<DoctorProfileDto[]>(base);
}

export async function createDoctorProfile(
  body: DoctorProfilePayload,
): Promise<DoctorProfileDto> {
  return adminData<DoctorProfileDto>(base, jsonBody("POST", body));
}

export async function updateDoctorProfile(
  doctorId: string,
  body: DoctorProfilePayload,
): Promise<DoctorProfileDto> {
  return adminData<DoctorProfileDto>(`${base}?id=${encodeURIComponent(doctorId)}`, jsonBody("PUT", body));
}

export async function patchDoctorProfile(
  doctorId: string,
  body: { active?: boolean; order?: number },
): Promise<DoctorProfileDto> {
  return adminData<DoctorProfileDto>(
    `${base}?id=${encodeURIComponent(doctorId)}`,
    jsonBody("PATCH", body),
  );
}

export async function deleteDoctorProfile(doctorId: string): Promise<void> {
  await adminData(`${base}?id=${encodeURIComponent(doctorId)}`, { method: "DELETE" });
}

export async function uploadDoctorPhoto(
  file: File,
  _entityId?: string | null,
): Promise<{ url: string; publicId: string }> {
  return uploadMedia(file, "single-image");
}
