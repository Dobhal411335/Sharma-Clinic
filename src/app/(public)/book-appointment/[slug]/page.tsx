import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BookAppointmentWizard } from "@/components/doctors/book-appointment-wizard";
import { pageSeo } from "@/data/site";
import {
  getDoctorBySlug,
  getDoctorProfiles,
} from "@/features/doctors/doctors.service";
import {
  doctorProfileSlug,
  formatDoctorDisplayName,
} from "@/types/doctors";

/** Need live searchParams (`date`, `start`) from the doctor schedule deep-link. */
export const dynamic = "force-dynamic";

type BookAppointmentPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string; start?: string }>;
};

export async function generateStaticParams() {
  const doctors = await getDoctorProfiles();
  return doctors
    .filter((doctor) => Boolean(doctor.staffDoctorId))
    .map((doctor) => ({
      slug: doctorProfileSlug(doctor.name),
    }));
}

export async function generateMetadata({
  params,
}: BookAppointmentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) {
    return { title: pageSeo.doctorNotFound.title };
  }

  const name = formatDoctorDisplayName(doctor.name);
  return {
    title: `Book appointment · ${name}`,
    description: `Book an appointment with ${name} at Sharma Clinic.`,
  };
}

export default async function BookAppointmentPage({
  params,
  searchParams,
}: BookAppointmentPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    notFound();
  }

  const displayName = formatDoctorDisplayName(doctor.name);
  const initialDate =
    typeof query.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(query.date)
      ? query.date
      : undefined;
  const initialStart =
    typeof query.start === "string" &&
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(query.start.trim())
      ? query.start.trim().slice(0, 5)
      : undefined;

  return (
    <div className="bg-[#f8f5ee]">
      <div className="container-page py-6 sm:py-8">
        <nav className="text-md text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/doctors" className="hover:text-foreground">
            Doctors
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/doctors/${doctorProfileSlug(doctor.name)}`}
            className="hover:text-foreground"
          >
            {displayName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Book appointment</span>
        </nav>

        <div className="mt-5 max-w-5xl mx-auto">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading booking form…</p>}>
            <BookAppointmentWizard
              doctor={doctor}
              initialDate={initialDate}
              initialStart={initialStart}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
