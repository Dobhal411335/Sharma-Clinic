import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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

type BookAppointmentPageProps = {
  params: Promise<{ slug: string }>;
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
}: BookAppointmentPageProps) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    notFound();
  }

  const displayName = formatDoctorDisplayName(doctor.name);

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
          <BookAppointmentWizard doctor={doctor} />
        </div>
      </div>
    </div>
  );
}
