export type DoctorProfile = {
  id: string;
  siteCode: "IN" | "COM";
  name: string;
  specializations: string[];
  about: string;
  experienceYears: number;
  state: string;
  city: string;
  phone: string;
  email: string;
  location: string;
  education: string;
  degree: string;
  workHistory: string;
  workDays: string;
  photoUrl: string;
  active: boolean;
  order: number;
};

/** Distinct filter options from active doctors on the site. */
export type DoctorProfileFacets = {
  specialities: string[];
  states: string[];
  citiesByState: Record<string, string[]>;
};

export type DoctorServiceItem = {
  id: string;
  iconKey: string;
  name: string;
  description: string;
  readMoreUrl: string;
  order: number;
  active: boolean;
};

export type DoctorPageConfig = {
  id: string | null;
  siteCode: "IN" | "COM";
  aboutHeading: string;
  aboutDescription: string;
  aboutHighlights: string[];
  aboutButtonLabel: string;
  aboutButtonUrl: string;
  aboutImageUrl: string;
  aboutImagePublicId: string;
  aboutSecondaryImageUrl: string;
  aboutSecondaryImagePublicId: string;
  experienceYears: number | null;
  servicesHeading: string;
  servicesSubheading: string;
  services: DoctorServiceItem[];
};

export type DoctorAppointmentCreatePayload = {
  doctorId: string;
  patientName: string;
  email: string;
  phone: string;
  scheduledAt: string;
  problem: string;
  medicalHistoryImageUrl?: string;
  medicalHistoryImagePublicId?: string;
  website?: string;
};

/**
 * Formats doctor display name to guarantee both title prefix (with a trailing dot)
 * and name are properly shown (e.g., "Dr. Daisy Bins", "MD. Daisy Bins", "Prof. Dr. Rajesh").
 */
export function formatDoctorDisplayName(rawName: string): string {
  const trimmed = String(rawName || "").trim().replace(/\s+/g, " ");
  if (!trimmed) return "";

  if (/^(Prof\.\s*Dr\.?|Prof\s+Dr\.?)\s+/i.test(trimmed)) {
    const rest = trimmed.replace(/^(Prof\.\s*Dr\.?|Prof\s+Dr\.?)\s+/i, "").trim();
    return `Prof. Dr. ${rest}`;
  }

  if (/^(Assoc\.\s*Prof\.?\s*Dr\.?|Assoc\s+Prof\.?\s+Dr\.?)\s+/i.test(trimmed)) {
    const rest = trimmed.replace(/^(Assoc\.\s*Prof\.?\s*Dr\.?|Assoc\s+Prof\.?\s+Dr\.?)\s+/i, "").trim();
    return `Assoc. Prof. Dr. ${rest}`;
  }

  if (/^(Assoc\.\s*Prof\.?|Assoc\s+Prof\.?)\s+/i.test(trimmed)) {
    const rest = trimmed.replace(/^(Assoc\.\s*Prof\.?|Assoc\s+Prof\.?)\s+/i, "").trim();
    return `Assoc. Prof. ${rest}`;
  }

  if (/^(Prof\.?)\s+/i.test(trimmed)) {
    const rest = trimmed.replace(/^(Prof\.?)\s+/i, "").trim();
    return `Prof. ${rest}`;
  }

  if (/^(Surgeon\.?)\s+/i.test(trimmed)) {
    const rest = trimmed.replace(/^(Surgeon\.?)\s+/i, "").trim();
    return `Surgeon. ${rest}`;
  }

  if (/^(MD\.?)\s+/i.test(trimmed)) {
    const rest = trimmed.replace(/^(MD\.?)\s+/i, "").trim();
    return `MD. ${rest}`;
  }

  if (/^(Dr\.?)\s+/i.test(trimmed)) {
    const rest = trimmed.replace(/^(Dr\.?)\s+/i, "").trim();
    return `Dr. ${rest}`;
  }

  return `Dr. ${trimmed}`;
}
