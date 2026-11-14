import { adminData, jsonBody } from "@/services/api/admin-fetch";
import type {
  BookingOrderDetail,
  BookingOrderListResult,
  BookingStatusUpdate,
} from "@/types/admin/booking-order";

const base = "/api/doctor/bookings";

export function fetchDoctorBookings(params: {
  status?: string;
  date?: string;
}) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.date) search.set("date", params.date);
  const qs = search.toString();
  return adminData<BookingOrderListResult>(`${base}${qs ? `?${qs}` : ""}`);
}

export function fetchDoctorBooking(id: string) {
  return adminData<BookingOrderDetail>(`${base}/${encodeURIComponent(id)}`);
}

export function patchDoctorBookingStatus(
  id: string,
  body: { status: BookingStatusUpdate; reason?: string },
) {
  return adminData<BookingOrderDetail>(
    `${base}/${encodeURIComponent(id)}`,
    jsonBody("PATCH", body),
  );
}
