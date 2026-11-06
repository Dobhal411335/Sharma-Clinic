"use client";

import { Search } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DoctorProfileFacets } from "@/types/doctors";

export const DOCTOR_FILTER_ALL = "__all__";

/** Keep name input and select triggers visually aligned. */
const FILTER_CONTROL_CLASS =
  "h-11 min-h-11 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm shadow-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 data-[size=default]:h-11 data-[size=default]:min-h-11";

export type DoctorSearchFilters = {
  name: string;
  speciality: string;
  state: string;
  city: string;
};

type DoctorsAppointmentBarProps = {
  filters: DoctorSearchFilters;
  facets: DoctorProfileFacets;
  resultCount: number;
  onFiltersChange: (filters: DoctorSearchFilters) => void;
  onReset: () => void;
  hasActiveFilter: boolean;
  isSearching: boolean;
  selectKey: number;
};

/**
 * Doctor search bar — name, specialization, state, and city filters.
 * Options come from the doctor profiles currently shown on the page.
 */
export function DoctorsAppointmentBar({
  filters,
  facets,
  resultCount,
  onFiltersChange,
  onReset,
  hasActiveFilter,
  isSearching,
  selectKey,
}: DoctorsAppointmentBarProps) {
  const cityOptions = filters.state
    ? (facets.citiesByState[filters.state] ?? [])
    : [];
  const cityDisabled = !filters.state;

  const patch = (partial: Partial<DoctorSearchFilters>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  return (
    <section
      className="bg-[#f8f5ee] py-10 md:py-14"
      aria-labelledby="find-doctor-heading"
    >
      <div className="container-page">
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-[var(--shadow-card)] md:p-5">
        <h2 id="find-doctor-heading" className="sr-only">
          Find a Doctor
        </h2>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-foreground">Doctor Name</span>
              <span className="relative block">
                <input
                  type="search"
                  name="doctor-name"
                  value={filters.name}
                  onChange={(event) => patch({ name: event.target.value })}
                  placeholder="Search name, specialization, or location"
                  autoComplete="off"
                  className={`${FILTER_CONTROL_CLASS} w-full pl-3.5 pr-10 text-foreground outline-none placeholder:text-muted-foreground`}
                />
                <Search
                  className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-primary"
                  aria-hidden
                />
              </span>
            </label>

            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">Specialization</p>
              <Select
                key={`speciality-${selectKey}`}
                value={filters.speciality || DOCTOR_FILTER_ALL}
                onValueChange={(value) =>
                  patch({
                    speciality: value === DOCTOR_FILTER_ALL ? "" : value,
                  })
                }
              >
                <SelectTrigger
                  id="doctor-speciality"
                  aria-label="Specialization"
                  className={`${FILTER_CONTROL_CLASS} w-full`}
                >
                  <SelectValue placeholder="All specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DOCTOR_FILTER_ALL}>All specializations</SelectItem>
                  {facets.specialities.map((speciality) => (
                    <SelectItem key={speciality} value={speciality}>
                      {speciality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">State</p>
              <Select
                key={`state-${selectKey}`}
                value={filters.state || DOCTOR_FILTER_ALL}
                onValueChange={(value) => {
                  const nextState = value === DOCTOR_FILTER_ALL ? "" : value;
                  patch({ state: nextState, city: "" });
                }}
              >
                <SelectTrigger
                  id="doctor-state"
                  aria-label="State"
                  className={`${FILTER_CONTROL_CLASS} w-full`}
                >
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DOCTOR_FILTER_ALL}>All states</SelectItem>
                  {facets.states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">City</p>
              <Select
                key={`city-${selectKey}-${filters.state || "none"}`}
                value={filters.city || DOCTOR_FILTER_ALL}
                onValueChange={(value) =>
                  patch({ city: value === DOCTOR_FILTER_ALL ? "" : value })
                }
                disabled={cityDisabled}
              >
                <SelectTrigger
                  id="doctor-city"
                  aria-label="City"
                  className={`${FILTER_CONTROL_CLASS} w-full disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <SelectValue
                    placeholder={cityDisabled ? "Select a state first" : "All cities"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DOCTOR_FILTER_ALL}>
                    {cityDisabled ? "Select a state first" : "All cities"}
                  </SelectItem>
                  {cityOptions.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {isSearching
                ? "Searching…"
                : `${resultCount} doctor${resultCount === 1 ? "" : "s"} found`}
            </p>
            {hasActiveFilter ? (
              <button
                type="button"
                onClick={onReset}
                disabled={isSearching}
                className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                Reset filters
              </button>
            ) : null}
          </div>
        </form>
        </div>
      </div>
    </section>
  );
}
