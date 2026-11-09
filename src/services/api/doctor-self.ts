import { adminData, jsonBody } from "@/services/api/admin-fetch";
import type { DoctorAccountDetail } from "@/types/admin/doctor-account";

export function fetchDoctorSelfProfile() {
  return adminData<DoctorAccountDetail>("/api/doctor/profile");
}

export function updateDoctorSelfProfile(body: Record<string, unknown>) {
  return adminData<DoctorAccountDetail>("/api/doctor/profile", jsonBody("PATCH", body));
}
