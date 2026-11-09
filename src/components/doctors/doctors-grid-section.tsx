"use client";

import {
  DoctorShowcaseCard,
  DoctorShowcaseCardSkeleton,
} from "@/components/doctors/doctor-showcase-card";
import type { DoctorProfile } from "@/types/doctors";

type DoctorsGridSectionProps = {
  doctors: DoctorProfile[];
  isLoading?: boolean;
  hasActiveFilter?: boolean;
  searchQuery?: string;
  onResetFilter?: () => void;
};

export function DoctorsGridSection({
  doctors,
  isLoading = false,
  hasActiveFilter = false,
  searchQuery = "",
  onResetFilter,
}: DoctorsGridSectionProps) {
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
        <div className="mb-10 text-center md:mb-12">
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
            className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-label="Loading doctors"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <DoctorShowcaseCardSkeleton key={index} />
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
              . Try another name, location, speciality, state, or city.
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
          <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {doctors.map((doctor) => (
              <DoctorShowcaseCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
