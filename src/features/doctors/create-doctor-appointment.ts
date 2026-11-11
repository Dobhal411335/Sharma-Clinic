import type {
  DoctorAppointmentCreatePayload,
  DoctorBookableSlot,
} from "@/types/doctors";

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

type ApiErrorBody = {
  success: false;
  error?: { code?: string; message?: string };
};

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T | ApiErrorBody;
  if (!response.ok || (body as ApiErrorBody).success === false) {
    const message =
      (body as ApiErrorBody).error?.message ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body as T;
}

export async function uploadDoctorMedicalHistoryImage(
  file: File,
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/public/uploads/medical-history", {
    method: "POST",
    body: formData,
  });
  const payload = await readJson<ApiSuccess<{ url: string; publicId: string }>>(
    response,
  );
  return payload.data;
}

export async function fetchDoctorSlots(
  doctorId: string,
  date: string,
): Promise<DoctorBookableSlot[]> {
  const response = await fetch(
    `/api/public/doctors/${encodeURIComponent(doctorId)}/slots?date=${encodeURIComponent(date)}`,
    { method: "GET", cache: "no-store" },
  );
  const payload = await readJson<
    ApiSuccess<{ slots: DoctorBookableSlot[] }>
  >(response);
  return payload.data.slots;
}

export async function createDoctorAppointment(
  payload: DoctorAppointmentCreatePayload,
): Promise<{
  appointmentId: string;
  bookingReference: string;
  accessToken: string;
  feeSnapshotPaise: number;
  requiresPayment: boolean;
  doctorName: string;
  startsAt: string;
  endsAt: string;
}> {
  const response = await fetch("/api/public/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await readJson<
    ApiSuccess<{
      appointmentId: string;
      bookingReference: string;
      accessToken: string;
      feeSnapshotPaise: number;
      requiresPayment: boolean;
      doctorName: string;
      startsAt: string;
      endsAt: string;
    }>
  >(response);
  return result.data;
}

export async function createAppointmentPaymentOrder(appointmentId: string): Promise<{
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}> {
  const response = await fetch("/api/payments/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appointmentId }),
  });
  const result = await readJson<
    ApiSuccess<{
      paymentId: string;
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
    }>
  >(response);
  return result.data;
}

export async function verifyAppointmentPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<unknown> {
  const response = await fetch("/api/payments/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson(response);
}
