import Link from "next/link";

import { Button } from "@/components/ui/button";
import { doctorProfileSlug, type DoctorProfile } from "@/types/doctors";

type DoctorDetailsBookingProps = {
  doctor: DoctorProfile;
};

export function DoctorDetailsBooking({ doctor }: DoctorDetailsBookingProps) {
  const canBook = Boolean(doctor.staffDoctorId);
  const bookingHref = `/book-appointment/${doctorProfileSlug(doctor.name)}`;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {canBook ? (
        <Button asChild size="lg">
          <Link href={bookingHref}>Book Appointment</Link>
        </Button>
      ) : (
        <Button type="button" size="lg" disabled>
          Book Appointment
        </Button>
      )}
      {!canBook ? (
        <p className="text-sm text-muted-foreground">
          Online booking is not available for this doctor yet.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Fee: ₹{Math.floor((doctor.consultationFeePaise ?? 0) / 100)}
        </p>
      )}
    </div>
  );
}
