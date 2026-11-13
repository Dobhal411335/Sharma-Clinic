import type { DoctorQualificationCard } from "@/types/doctors";

export type DoctorProfileDto = {
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
  qualificationTitle: string;
  qualificationCards: DoctorQualificationCard[];
  photoUrl: string;
  photoPublicId: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type DoctorProfileFormValues = {
  prefix?: string;
  name: string;
  specializations: string[];
  about: string;
  experienceYears: string;
  state: string;
  city: string;
  phone: string;
  email: string;
  location: string;
  qualificationTitle: string;
  qualificationCards: DoctorQualificationCard[];
  photoUrl: string;
  photoPublicId: string;
  active: boolean;
  order: string;
  /** Whole INR rupees for UI; persisted as paise on Doctor. */
  consultationFeeInr: string;
};

export type DoctorProfilePayload = {
  name: string;
  specializations: string[];
  about: string;
  experienceYears: number;
  state: string;
  city: string;
  phone: string;
  email: string;
  location: string;
  qualificationTitle: string;
  qualificationCards: DoctorQualificationCard[];
  photoUrl: string;
  photoPublicId: string;
  active: boolean;
  order?: number;
  /** Integer paise. */
  consultationFeePaise?: number;
};
