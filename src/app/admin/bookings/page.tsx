import type { Metadata } from "next";

import { BookingOrderPage } from "@/components/admin/bookings/booking-order-page";

export const metadata: Metadata = { title: "Booking Order" };

export default function Page() {
  return <BookingOrderPage />;
}
