import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DoctorDetailsHero } from "@/components/doctors/doctor-details-hero";
import { DoctorDetailsScheduleContact } from "@/components/doctors/doctor-details-schedule-contact";
import { pageSeo } from "@/data/site";
import { listPublicDoctorAvailability } from "@/features/doctors/doctor-availability.service";
import {
  getDoctorBySlug,
  getDoctorProfiles,
} from "@/features/doctors/doctors.service";
import {
  doctorProfileSlug,
  formatDoctorDisplayName,
} from "@/types/doctors";

type DoctorDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const doctors = await getDoctorProfiles();
  return doctors.map((doctor) => ({
    slug: doctorProfileSlug(doctor.name),
  }));
}

export async function generateMetadata({
  params,
}: DoctorDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) {
    return { title: pageSeo.doctorNotFound.title };
  }

  const name = formatDoctorDisplayName(doctor.name);
  const specialty = doctor.specializations[0]?.trim();
  const description =
    doctor.about
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160) ||
    (specialty ? `${name} — ${specialty}` : name);

  return {
    title: name,
    description,
  };
}

export default async function DoctorDetailsPage({
  params,
}: DoctorDetailsPageProps) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    notFound();
  }

  const displayName = formatDoctorDisplayName(doctor.name);
  const scheduleWindows = doctor.staffDoctorId
    ? await listPublicDoctorAvailability(doctor.staffDoctorId)
    : [];

  return (
    <div className="bg-[#f8f5ee]">
      <div className="container-page pt-10">
        <nav className="text-md text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/doctors" className="hover:text-foreground">
            Doctors
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{displayName}</span>
        </nav>
      </div>

      <DoctorDetailsHero doctor={doctor} />
      <DoctorDetailsScheduleContact
        doctor={doctor}
        scheduleWindows={scheduleWindows.map((window) => ({
          weekday: window.weekday,
          startTimeLocal: window.startTimeLocal,
          endTimeLocal: window.endTimeLocal,
        }))}
      />
    </div>
  );
}
