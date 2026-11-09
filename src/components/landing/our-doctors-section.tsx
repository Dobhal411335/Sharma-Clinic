"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";

import { DoctorShowcaseCard } from "@/components/doctors/doctor-showcase-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { DoctorProfile } from "@/types/doctors";

type OurDoctorsSectionProps = {
  doctors: DoctorProfile[];
  specialities: string[];
};

export function OurDoctorsSection({ doctors, specialities }: OurDoctorsSectionProps) {
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>("all");
  const [carouselKey, setCarouselKey] = useState(0);

  const filteredDoctors = useMemo(() => {
    if (selectedSpeciality === "all") return doctors;
    return doctors.filter((doctor) =>
      doctor.specializations.some(
        (item) => item.toLowerCase() === selectedSpeciality.toLowerCase(),
      ),
    );
  }, [doctors, selectedSpeciality]);

  if (doctors.length === 0) return null;

  const tabs = ["all", ...specialities];

  return (
    <section
      className="bg-[#f8f5ee] py-16 sm:py-20 lg:py-24"
      aria-labelledby="our-doctors-heading"
    >
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#ef6a24] uppercase">
            Doctors
          </p>
          <h2
            id="our-doctors-heading"
            className="mt-5 max-w-5xl text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-foreground sm:text-5xl"
          >
            Our Experts Doctors{" "}
            <span className="font-bold">For The Patients</span>
          </h2>
        </div>

        {specialities.length > 0 ? (
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:mt-10"
            role="tablist"
            aria-label="Filter doctors by speciality"
          >
            {tabs.map((speciality) => {
              const isActive = selectedSpeciality === speciality;
              const label = speciality === "all" ? "All" : speciality;
              return (
                <button
                  key={speciality}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setSelectedSpeciality(speciality);
                    setCarouselKey((key) => key + 1);
                  }}
                  className={cn(
                    "rounded-full border px-5 py-2.5 text-xs font-semibold tracking-[0.08em] uppercase transition-colors sm:text-[13px]",
                    isActive
                      ? "border-transparent bg-[#dceaf7] text-[#123d67]"
                      : "border-[#c5d6e8] bg-white text-muted-foreground hover:border-[#9eb6d0] hover:text-[#123d67]",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : null}

        {filteredDoctors.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            No doctors found for this speciality.
          </p>
        ) : (
          <div className="relative mt-10 sm:mt-12">
            <Carousel
              key={carouselKey}
              opts={{ align: "start", loop: filteredDoctors.length > 4 }}
              className="w-full"
            >
              <CarouselContent className="-ml-5">
                {filteredDoctors.map((doctor) => (
                  <CarouselItem
                    key={doctor.id}
                    className="basis-[85%] pl-5 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <DoctorShowcaseCard doctor={doctor} />
                  </CarouselItem>
                ))}
              </CarouselContent>

              {filteredDoctors.length > 1 ? (
                <>
                  <CarouselPrevious className="left-0 size-11 border-border bg-[#e8eef3] text-[#123d67] shadow-sm hover:bg-[#dce5ee] disabled:hidden md:-left-5 lg:-left-6" />
                  <CarouselNext className="right-0 size-11 border-border bg-[#e8eef3] text-[#123d67] shadow-sm hover:bg-[#dce5ee] disabled:hidden md:-right-5 lg:-right-6" />
                </>
              ) : null}
            </Carousel>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/doctors"
            className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            View all doctors
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
