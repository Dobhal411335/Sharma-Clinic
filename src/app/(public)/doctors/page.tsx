import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { DoctorsAboutSection } from "@/components/doctors/doctors-about-section";
import { DoctorsDirectory } from "@/components/doctors/doctors-directory";
import { DoctorsServicesSection } from "@/components/doctors/doctors-services-section";
import { pageSeo } from "@/data/site";
import {
  getDoctorPageConfig,
  getDoctorProfileFacets,
  getDoctorProfiles,
} from "@/features/doctors/doctors.service";

export const metadata: Metadata = {
  title: pageSeo.doctors.title,
  description: pageSeo.doctors.description,
};

export default async function DoctorsPage() {
  const [pageConfig, doctors, facets] = await Promise.all([
    getDoctorPageConfig(),
    getDoctorProfiles(),
    getDoctorProfileFacets(),
  ]);

  const hasAbout =
    Boolean(pageConfig.aboutHeading) ||
    Boolean(pageConfig.aboutDescription) ||
    pageConfig.aboutHighlights.length > 0 ||
    Boolean(pageConfig.aboutImageUrl);
  const hasServices =
    Boolean(pageConfig.servicesHeading) ||
    Boolean(pageConfig.servicesSubheading) ||
    pageConfig.services.length > 0;
  const emptyPage = !hasAbout && !hasServices && doctors.length === 0;

  return (
    <div className="bg-[#f8f5ee]">
      <div className="container-page pt-10">
        <nav className="text-md text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Doctors</span>
        </nav>
      </div>

      {emptyPage ? (
        <section className="container-page py-20 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Doctors</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Doctor profiles and landing content will appear here once published in
            admin.
          </p>
        </section>
      ) : (
        <>
          <DoctorsAboutSection config={pageConfig} />
          <DoctorsServicesSection config={pageConfig} />
          <Suspense fallback={null}>
            <DoctorsDirectory doctors={doctors} facets={facets} />
          </Suspense>
        </>
      )}
    </div>
  );
}
