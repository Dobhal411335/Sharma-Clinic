import { publicApiFetch } from "@/lib/api/client";
import type { DoctorAppointmentCreatePayload } from "@/types/doctors";

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

const STOREFRONT_SITE_CODE = "IN" as const;

export async function uploadDoctorMedicalHistoryImage(
  file: File,
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const payload = await publicApiFetch<ApiSuccess<{ url: string; publicId: string }>>(
    `/sites/${STOREFRONT_SITE_CODE}/doctors/medical-history`,
    { method: "POST", body: formData },
  );

  return payload.data;
}

export async function createDoctorAppointment(
  payload: DoctorAppointmentCreatePayload,
): Promise<void> {
  await publicApiFetch<ApiSuccess<unknown>>(
    `/sites/${STOREFRONT_SITE_CODE}/doctors/appointments`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
