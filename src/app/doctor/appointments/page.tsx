import type { Metadata } from "next";

import { DoctorBookingOrderPage } from "@/components/doctor/bookings/doctor-booking-order-page";

export const metadata: Metadata = { title: "Appointments" };

export default function Page() {
  return <DoctorBookingOrderPage />;
}
