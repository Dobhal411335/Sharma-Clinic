import { adminData, jsonBody } from "@/services/api/admin-fetch";
import type {
  DoctorAccountDetail,
  DoctorAccountListItem,
} from "@/types/admin/doctor-account";

const base = "/api/admin/doctors/accounts";

export function fetchDoctorAccounts(status = "ALL") {
  return adminData<DoctorAccountListItem[]>(
    `${base}?status=${encodeURIComponent(status)}`,
  );
}

export function createDoctorAccount(body: {
  name: string;
  email: string;
  phone: string;
  password: string;
  passcode: string;
  emailVerificationToken: string;
}) {
  return adminData<DoctorAccountListItem>(base, jsonBody("POST", body));
}

export function fetchDoctorAccount(id: string) {
  return adminData<DoctorAccountDetail>(`${base}/${encodeURIComponent(id)}`);
}

export function updateDoctorAccount(
  id: string,
  body: Record<string, unknown>,
) {
  return adminData<DoctorAccountDetail>(
    `${base}/${encodeURIComponent(id)}`,
    jsonBody("PATCH", body),
  );
}

export function approveDoctorAccount(
  id: string,
  body: { password?: string; passcode?: string },
) {
  return adminData<DoctorAccountListItem & { passwordForEmail: string }>(
    `${base}/${encodeURIComponent(id)}/approve`,
    jsonBody("POST", body),
  );
}

export function sendDoctorCredentials(id: string) {
  return adminData<DoctorAccountListItem>(
    `${base}/${encodeURIComponent(id)}/send-credentials`,
    jsonBody("POST", {}),
  );
}

export function disableDoctorAccount(id: string) {
  return adminData<DoctorAccountListItem>(
    `${base}/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export function sendDoctorEmailVerification(email: string) {
  return adminData<{ cooldownSeconds: number }>(
    `${base}/verify-email/send`,
    jsonBody("POST", { email }),
  );
}

export function confirmDoctorEmailVerification(email: string, otp: string) {
  return adminData<{ verificationToken: string }>(
    `${base}/verify-email/confirm`,
    jsonBody("POST", { email, otp }),
  );
}
