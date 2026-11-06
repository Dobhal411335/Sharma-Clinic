export type DoctorServiceIconKey =
  | "Stethoscope"
  | "HeartPulse"
  | "Ambulance"
  | "FlaskConical"
  | "Eye"
  | "LayoutGrid"
  | "Bone"
  | "Brain"
  | "Baby"
  | "Pill"
  | "Activity"
  | "Syringe"
  | "Hospital"
  | "Microscope"
  | "Thermometer"
  | "Scan";

export const DOCTOR_SERVICE_ICON_OPTIONS: readonly DoctorServiceIconKey[] = [
  "Stethoscope",
  "HeartPulse",
  "Ambulance",
  "FlaskConical",
  "Eye",
  "LayoutGrid",
  "Bone",
  "Brain",
  "Baby",
  "Pill",
  "Activity",
  "Syringe",
  "Hospital",
  "Microscope",
  "Thermometer",
  "Scan",
] as const;

export type DoctorServiceItemDto = {
  id: string;
  iconKey: string;
  name: string;
  description: string;
  readMoreUrl: string;
  order: number;
  active: boolean;
};

export type DoctorPageConfigDto = {
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
  services: DoctorServiceItemDto[];
  updatedAt: string | null;
};

export type DoctorServiceItemFormValues = {
  key: string;
  iconKey: DoctorServiceIconKey;
  name: string;
  description: string;
  readMoreUrl: string;
  active: boolean;
};

export type DoctorPageFormValues = {
  aboutHeading: string;
  aboutDescription: string;
  aboutHighlights: string[];
  aboutButtonLabel: string;
  aboutButtonUrl: string;
  aboutImageUrl: string;
  aboutImagePublicId: string;
  aboutSecondaryImageUrl: string;
  aboutSecondaryImagePublicId: string;
  experienceYears: string;
  servicesHeading: string;
  servicesSubheading: string;
  services: DoctorServiceItemFormValues[];
};

export type DoctorPagePayload = {
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
  services: Array<{
    iconKey: DoctorServiceIconKey;
    name: string;
    description: string;
    readMoreUrl: string;
    active: boolean;
    order: number;
  }>;
};
