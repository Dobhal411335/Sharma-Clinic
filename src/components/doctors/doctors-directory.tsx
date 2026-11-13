"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  DoctorsAppointmentBar,
  type DoctorSearchFilters,
} from "@/components/doctors/doctors-appointment-bar";
import { DoctorsGridSection } from "@/components/doctors/doctors-grid-section";
import {
  formatDoctorDisplayName,
  type DoctorProfile,
  type DoctorProfileFacets,
} from "@/types/doctors";

type DoctorsDirectoryProps = {
  doctors: DoctorProfile[];
  facets: DoctorProfileFacets;
};

const EMPTY_FILTERS: DoctorSearchFilters = {
  name: "",
  speciality: "",
  state: "",
  city: "",
  location: "",
};

function normalizeFilters(filters: DoctorSearchFilters): DoctorSearchFilters {
  return {
    name: filters.name.trim(),
    speciality: filters.speciality.trim(),
    state: filters.state.trim(),
    city: filters.city.trim(),
    location: filters.location.trim(),
  };
}

function hasFilters(filters: DoctorSearchFilters): boolean {
  const normalized = normalizeFilters(filters);
  return Boolean(
    normalized.name ||
      normalized.speciality ||
      normalized.state ||
      normalized.city ||
      normalized.location,
  );
}

function locationSearchText(doctor: DoctorProfile): string {
  return [doctor.location, doctor.city, doctor.state]
    .join(" ")
    .toLowerCase();
}

function matchesDoctor(
  doctor: DoctorProfile,
  filters: DoctorSearchFilters,
): boolean {
  const { name, speciality, city, state, location } = normalizeFilters(filters);

  if (name && !profileSearchText(doctor).includes(name.toLowerCase())) {
    return false;
  }
  if (
    speciality &&
    !doctor.specializations.some(
      (item) => item.toLowerCase() === speciality.toLowerCase(),
    )
  ) {
    return false;
  }
  if (state && doctor.state.toLowerCase() !== state.toLowerCase()) {
    return false;
  }
  if (city && doctor.city.toLowerCase() !== city.toLowerCase()) {
    return false;
  }
  if (location && !locationSearchText(doctor).includes(location.toLowerCase())) {
    return false;
  }

  return true;
}

function uniqueSorted(values: Iterable<string>): string[] {
  const seen = new Map<string, string>();
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/** Filter options from the same doctor records shown in the profile modal. */
function facetsFromDoctors(doctors: DoctorProfile[]): DoctorProfileFacets {
  const stateLabels = new Map<string, string>();
  const citiesByState = new Map<string, string[]>();

  for (const doctor of doctors) {
    const state = doctor.state.trim();
    const city = doctor.city.trim();
    if (!state) continue;
    const stateKey = state.toLowerCase();
    if (!stateLabels.has(stateKey)) stateLabels.set(stateKey, state);
    const cities = citiesByState.get(stateKey) ?? [];
    if (city) cities.push(city);
    citiesByState.set(stateKey, cities);
  }

  const states = uniqueSorted(stateLabels.values());
  return {
    specialities: uniqueSorted(doctors.flatMap((doctor) => doctor.specializations)),
    states,
    citiesByState: Object.fromEntries(
      states.map((state) => [
        state,
        uniqueSorted(citiesByState.get(state.toLowerCase()) ?? []),
      ]),
    ),
  };
}

function profileSearchText(doctor: DoctorProfile): string {
  const qualificationBits = [
    doctor.qualificationTitle,
    ...(doctor.qualificationCards ?? []).flatMap((card) => [
      card.heading,
      ...card.descriptions.map((html) => html.replace(/<[^>]*>/g, " ")),
    ]),
  ];

  return [
    doctor.name,
    formatDoctorDisplayName(doctor.name),
    ...doctor.specializations,
    doctor.location,
    doctor.city,
    doctor.state,
    ...qualificationBits,
    doctor.about.replace(/<[^>]*>/g, " "),
    doctor.experienceYears > 0 ? `${doctor.experienceYears}` : "",
  ]
    .join(" ")
    .toLowerCase();
}

function formatFilterSummary(filters: DoctorSearchFilters): string {
  const parts = [
    filters.name.trim() || null,
    filters.location.trim() || null,
    filters.speciality.trim() || null,
    filters.city.trim() || null,
    filters.state.trim() || null,
  ].filter(Boolean);
  return parts.join(" · ");
}

function filtersFromSearchParams(
  params: URLSearchParams,
): DoctorSearchFilters | null {
  const next: DoctorSearchFilters = {
    name: params.get("name")?.trim() ?? "",
    speciality: params.get("speciality")?.trim() ?? "",
    state: params.get("state")?.trim() ?? "",
    city: params.get("city")?.trim() ?? "",
    location: params.get("location")?.trim() ?? "",
  };
  return hasFilters(next) ? next : null;
}

export function DoctorsDirectory({ doctors, facets }: DoctorsDirectoryProps) {
  const searchParams = useSearchParams();
  const initialFromUrl = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );
  const [draft, setDraft] = useState<DoctorSearchFilters>(
    () => initialFromUrl ?? EMPTY_FILTERS,
  );
  const [applied, setApplied] = useState<DoctorSearchFilters>(
    () => initialFromUrl ?? EMPTY_FILTERS,
  );
  const [selectKey, setSelectKey] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchTimeoutRef = useRef<number | null>(null);
  const appliedUrlKeyRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current != null) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const key = searchParams.toString();
    if (appliedUrlKeyRef.current === key) return;
    appliedUrlKeyRef.current = key;
    const fromUrl = filtersFromSearchParams(searchParams);
    if (!fromUrl) return;
    setDraft(fromUrl);
    setApplied(fromUrl);
    setSelectKey((value) => value + 1);
  }, [searchParams]);

  const liveFacets = useMemo(() => facetsFromDoctors(doctors), [doctors]);
  const filteredDoctors = doctors.filter((doctor) =>
    matchesDoctor(doctor, applied),
  );
  const hasActiveFilter = hasFilters(applied);
  const showSkeleton = isSearching || isPending;

  const runSearch = (nextFilters: DoctorSearchFilters) => {
    const normalized = normalizeFilters(nextFilters);
    setDraft({
      name: nextFilters.name,
      location: nextFilters.location,
      speciality: normalized.speciality,
      state: normalized.state,
      city: normalized.city,
    });

    if (searchTimeoutRef.current != null) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = window.setTimeout(() => {
      startTransition(() => {
        setApplied(normalized);
        setIsSearching(false);
      });
    }, 220);
  };

  const handleFiltersChange = (nextFilters: DoctorSearchFilters) => {
    runSearch(nextFilters);
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setSelectKey((key) => key + 1);
    runSearch(EMPTY_FILTERS);
  };

  return (
    <>
      <DoctorsAppointmentBar
        filters={draft}
        facets={
          liveFacets.specialities.length > 0 || liveFacets.states.length > 0
            ? liveFacets
            : facets
        }
        resultCount={filteredDoctors.length}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
        hasActiveFilter={hasActiveFilter || hasFilters(draft)}
        isSearching={showSkeleton}
        selectKey={selectKey}
      />
      <DoctorsGridSection
        doctors={filteredDoctors}
        isLoading={showSkeleton}
        hasActiveFilter={hasActiveFilter}
        searchQuery={formatFilterSummary(applied)}
        onResetFilter={handleReset}
      />
    </>
  );
}
