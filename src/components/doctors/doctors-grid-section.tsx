"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

import type { DoctorSearchFilters } from "@/components/doctors/doctors-appointment-bar";
import { DoctorAppointmentModal } from "@/components/doctors/doctor-appointment-modal";
import { DoctorProfileModal } from "@/components/doctors/doctor-profile-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDoctorDisplayName, type DoctorProfile } from "@/types/doctors";
import Image from "next/image";

type DoctorsGridSectionProps = {
  doctors: DoctorProfile[];
  allDoctors: DoctorProfile[];
  isLoading?: boolean;
  hasActiveFilter?: boolean;
  searchQuery?: string;
  onResetFilter?: () => void;
  onApplyProfileFilter?: (filters: Partial<DoctorSearchFilters>) => void;
};

function locationLine(doctor: DoctorProfile): string {
  return [doctor.city, doctor.state].filter(Boolean).join(", ");
}

function DoctorCardSkeleton() {
  return (
    <article className="relative rounded-2xl border border-border/60 bg-background px-5 pb-6 pt-14 text-center shadow-[var(--shadow-card)]">
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <Skeleton className="size-30 rounded-full border-4 border-background" />
      </div>
      <Skeleton className="mx-auto h-5 w-36" />
      <Skeleton className="mx-auto mt-3 h-3 w-44" />
      <Skeleton className="mx-auto mt-4 h-3 w-full max-w-[14rem]" />
      <Skeleton className="mx-auto mt-2 h-3 w-full max-w-[12rem]" />
      <Skeleton className="mx-auto mt-5 h-4 w-24" />
    </article>
  );
}

export function DoctorsGridSection({
  doctors,
  allDoctors,
  isLoading = false,
  hasActiveFilter = false,
  searchQuery = "",
  onResetFilter,
  onApplyProfileFilter,
}: DoctorsGridSectionProps) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [profileDoctorId, setProfileDoctorId] = useState<string | null>(null);

  if (!isLoading && !hasActiveFilter && doctors.length === 0) {
    return null;
  }

  return (
    <section
      className="bg-[#f8f5ee] py-10"
      aria-labelledby="doctors-grid-heading"
      aria-busy={isLoading}
    >
      <div className="container-page">
        <div className="mb-20 text-center md:mb-24">
          <h2
            id="doctors-grid-heading"
            className="text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            Meet Our Specialists
          </h2>
          {hasActiveFilter && !isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {doctors.length === 0
                ? `No results for “${searchQuery.trim()}”`
                : `${doctors.length} result${doctors.length === 1 ? "" : "s"} for “${searchQuery.trim()}”`}
            </p>
          ) : null}
        </div>

        {isLoading ? (
          <div
            className="grid gap-x-5 gap-y-20 sm:grid-cols-2 sm:gap-y-24 lg:grid-cols-3 xl:grid-cols-4"
            aria-label="Loading doctors"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <DoctorCardSkeleton key={index} />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-border/70 bg-background px-6 py-12 text-center shadow-[var(--shadow-card)]">
            <p className="text-lg font-semibold text-foreground">Doctor not found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              No doctor matched your search
              {searchQuery.trim() ? (
                <>
                  {" "}
                  for <span className="font-medium text-foreground">“{searchQuery.trim()}”</span>
                </>
              ) : null}
              . Try another name, speciality, state, or city.
            </p>
            {onResetFilter ? (
              <button
                type="button"
                onClick={onResetFilter}
                className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Reset filter
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-x-5 gap-y-20 sm:grid-cols-2 sm:gap-y-24 lg:grid-cols-3 xl:grid-cols-4">
            {doctors.map((doctor) => (
              <article
                key={doctor.id}
                className="group relative rounded-2xl border border-border/60 bg-background px-5 pb-6 pt-14 text-center transition-colors duration-500 hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                  <div className="size-30 overflow-hidden rounded-full border-4 border-background bg-muted shadow-md transition-colors group-hover:border-primary">
                    <Image
                    width={100}
                    height={100}
                    quality={100}
                    loading="lazy"
                    src={doctor.photoUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary-foreground">
                  {formatDoctorDisplayName(doctor.name)}
                </h3>
                {doctor.specializations.length > 0 ? (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                    {doctor.specializations.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold leading-none text-primary transition-colors group-hover:bg-background group-hover:text-primary"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
                {doctor.experienceYears > 0 || locationLine(doctor) ? (
                  <p className="mt-2 text-xs text-muted-foreground transition-colors group-hover:text-primary-foreground/80">
                    {[
                      doctor.experienceYears > 0 ? `${doctor.experienceYears} yrs` : "",
                      locationLine(doctor),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-primary-foreground/90">
                  {doctor.about}
                </p>
                <div className="mt-5 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDoctorId(doctor.id);
                      setProfileOpen(true);
                    }}
                    className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground transition-colors"
                  >
                    View profile
                    <ArrowUpRight className="size-4" aria-hidden />

                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDoctorId(doctor.id);
                      setOpen(true);
                    }}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    Appointment
                    <ArrowUpRight className="size-4" aria-hidden />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <DoctorProfileModal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        doctor={
          doctors.find((item) => item.id === profileDoctorId) ??
          allDoctors.find((item) => item.id === profileDoctorId) ??
          null
        }
        onSelectSpecialization={(specialization) => {
          setProfileOpen(false);
          onApplyProfileFilter?.({ speciality: specialization });
        }}
        onSelectLocation={({ state, city }) => {
          setProfileOpen(false);
          onApplyProfileFilter?.({ state, city });
        }}
      />
      <DoctorAppointmentModal
        open={open}
        onOpenChange={setOpen}
        doctors={allDoctors}
        initialDoctorId={selectedDoctorId}
      />
    </section>
  );
}
