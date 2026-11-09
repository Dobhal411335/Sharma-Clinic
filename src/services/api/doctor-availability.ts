import { adminData, jsonBody } from "@/services/api/admin-fetch";
import type {
  DoctorAvailabilityDto,
  DoctorAvailabilityPayload,
} from "@/types/doctors-availability";

export function fetchAdminDoctorAvailability(userId: string) {
  return adminData<DoctorAvailabilityDto>(
    `/api/admin/doctors/accounts/${encodeURIComponent(userId)}/availability`,
  );
}

export function saveAdminDoctorAvailability(
  userId: string,
  body: DoctorAvailabilityPayload,
) {
  return adminData<DoctorAvailabilityDto>(
    `/api/admin/doctors/accounts/${encodeURIComponent(userId)}/availability`,
    jsonBody("PUT", body),
  );
}

export function fetchDoctorSelfAvailability() {
  return adminData<DoctorAvailabilityDto>("/api/doctor/availability");
}

export function saveDoctorSelfAvailability(body: DoctorAvailabilityPayload) {
  return adminData<DoctorAvailabilityDto>(
    "/api/doctor/availability",
    jsonBody("PUT", body),
  );
}
