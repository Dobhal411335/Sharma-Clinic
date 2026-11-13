import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DoctorDetailsHero } from "@/components/doctors/doctor-details-hero";
import { DoctorWeekScheduleSection } from "@/components/doctors/doctor-week-schedule";
import { pageSeo } from "@/data/site";
import { buildDoctorWeekSchedule } from "@/features/doctors/doctor-availability.service";
import {
  getDoctorBySlug,
  getDoctorProfiles,
} from "@/features/doctors/doctors.service";
import { plainTextForShare } from "@/lib/share-text";
import {
  doctorProfileSlug,
  formatDoctorDisplayName,
} from "@/types/doctors";

/** Week schedule must use the live clinic calendar, not a stale static build. */
export const dynamic = "force-dynamic";

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
  const aboutText = plainTextForShare(doctor.about, 160);
  const description =
    aboutText || (specialty ? `${name} — ${specialty}` : name);

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
  const weekSchedule =
    doctor.staffDoctorId
      ? await buildDoctorWeekSchedule({
          doctorId: doctor.staffDoctorId,
          doctorSlug: doctorProfileSlug(doctor.name),
        })
      : null;

  return (
    <div className="bg-background">
      <div className="container-page pt-8 sm:pt-10">
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
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

      {weekSchedule ? (
        <DoctorWeekScheduleSection doctor={doctor} schedule={weekSchedule} />
      ) : null}
    </div>
  );
}
