import { cache } from "react";

import {
  doctorProfileSlug,
  type DoctorPageConfig,
  type DoctorProfile,
  type DoctorProfileFacets,
} from "@/types/doctors";

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

const STOREFRONT_SITE_CODE = "IN" as const;

export const emptyDoctorProfileFacets = (): DoctorProfileFacets => ({
  specialities: [],
  states: [],
  citiesByState: {},
});

function apiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) {
    return "";
  }
  return value.replace(/\/$/, "");
}

export const emptyDoctorPageConfig = (): DoctorPageConfig => ({
  id: null,
  siteCode: STOREFRONT_SITE_CODE,
  aboutHeading: "",
  aboutDescription: "",
  aboutHighlights: [],
  aboutButtonLabel: "",
  aboutButtonUrl: "",
  aboutImageUrl: "",
  aboutImagePublicId: "",
  aboutSecondaryImageUrl: "",
  aboutSecondaryImagePublicId: "",
  experienceYears: null,
  servicesHeading: "",
  servicesSubheading: "",
  services: [],
});

/**
 * Server-side fetch of active doctor profiles for the .in storefront.
 */
async function loadDoctorProfiles(): Promise<DoctorProfile[]> {
  const { listItems } = await import("@/features/cms/store");
  const items = (await listItems("doctor-profile")) as unknown as DoctorProfile[];
  return items
    .map((item) => ({
      ...item,
      specializations: Array.isArray(item.specializations)
        ? item.specializations.filter(Boolean)
        : [],
      phone: item.phone ?? "",
      email: item.email ?? "",
      location: item.location ?? "",
      education: item.education ?? "",
      degree: item.degree ?? "",
      workHistory: item.workHistory ?? "",
      workDays: item.workDays ?? "",
      staffDoctorId:
        typeof (item as { staffDoctorId?: unknown }).staffDoctorId === "string"
          ? (item as { staffDoctorId: string }).staffDoctorId
          : null,
      staffUserId:
        typeof (item as { staffUserId?: unknown }).staffUserId === "string"
          ? (item as { staffUserId: string }).staffUserId
          : null,
    }))
    .filter(
      (item) => item.active && item.name && item.photoUrl && item.specializations.length > 0,
    );
}

export const getDoctorProfiles = cache(async (): Promise<DoctorProfile[]> => {
  try {
    return await loadDoctorProfiles();
  } catch {
    return [];
  }
});

/**
 * Resolve an active doctor by name-derived slug for public profile pages.
 */
export const getDoctorBySlug = cache(
  async (slug: string): Promise<DoctorProfile | null> => {
    const normalized = slug.trim().toLowerCase();
    if (!normalized) return null;
    const doctors = await getDoctorProfiles();
    return (
      doctors.find((doctor) => doctorProfileSlug(doctor.name) === normalized) ??
      null
    );
  },
);

/**
 * Server-side fetch of distinct speciality / state / city filter options.
 */
export const getDoctorProfileFacets = cache(
  async (): Promise<DoctorProfileFacets> => {
    try {
      const profiles = await loadDoctorProfiles();
      const specialities = [
        ...new Set(profiles.flatMap((profile) => profile.specializations).filter(Boolean)),
      ];
      const states = [...new Set(profiles.map((profile) => profile.state).filter(Boolean))];
      const citiesByState: Record<string, string[]> = {};
      for (const profile of profiles) {
        if (!profile.state || !profile.city) continue;
        const cities = citiesByState[profile.state] ?? [];
        if (!cities.includes(profile.city)) cities.push(profile.city);
        citiesByState[profile.state] = cities;
      }
      return { specialities, states, citiesByState };
    } catch {
      return emptyDoctorProfileFacets();
    }
  },
);

/**
 * Server-side fetch of doctors landing page config (about + services).
 */
export const getDoctorPageConfig = cache(async (): Promise<DoctorPageConfig> => {
  try {
    const { readSingleton, withSite } = await import("@/features/cms/store");
    const row = await readSingleton("doctor-page");
    if (!row) return emptyDoctorPageConfig();
    const data = withSite(row.payload, {
      id: "doctor-page",
      updatedAt: row.updatedAt,
    }) as unknown as DoctorPageConfig;
    return {
      ...emptyDoctorPageConfig(),
      ...data,
      aboutHighlights: Array.isArray(data.aboutHighlights) ? data.aboutHighlights : [],
      services: Array.isArray(data.services)
        ? data.services.filter((service) => service.active)
        : [],
    };
  } catch {
    return emptyDoctorPageConfig();
  }
});
