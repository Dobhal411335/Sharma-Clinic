import { isIndiaState } from "@/lib/india-states";
import type {
  DoctorProfileFormValues,
  DoctorProfilePayload,
} from "@/types/admin/doctor-profile";

export type DoctorProfileFormErrors = Partial<
  Record<keyof DoctorProfileFormValues, string>
>;

export const DOCTOR_PREFIX_OPTIONS = [
  { value: "Dr.", label: "Dr." },
  { value: "MD", label: "MD" },
  { value: "Prof.", label: "Prof." },
  { value: "Prof. Dr.", label: "Prof. Dr." },
  { value: "Assoc. Prof.", label: "Assoc. Prof." },
  { value: "Surgeon", label: "Surgeon" },
] as const;

export type DoctorPrefix = (typeof DOCTOR_PREFIX_OPTIONS)[number]["value"];

export function extractDoctorPrefixAndName(raw: string): {
  prefix: DoctorPrefix;
  name: string;
} {
  const trimmed = raw.trim().replace(/\s+/g, " ");

  const multiPrefixes: Array<{ prefix: DoctorPrefix; pattern: RegExp }> = [
    { prefix: "Prof. Dr.", pattern: /^(Prof\.\s*Dr\.?|Prof\s+Dr\.?)\s+/i },
    { prefix: "Assoc. Prof.", pattern: /^(Assoc\.\s*Prof\.?|Assoc\s+Prof\.?)\s+/i },
    { prefix: "Prof.", pattern: /^(Prof\.?)\s+/i },
    { prefix: "Surgeon", pattern: /^(Surgeon)\s+/i },
    { prefix: "MD", pattern: /^(MD\.?)\s+/i },
    { prefix: "Dr.", pattern: /^(Dr\.?)\s+/i },
  ];

  for (const item of multiPrefixes) {
    if (item.pattern.test(trimmed)) {
      return {
        prefix: item.prefix,
        name: trimmed.replace(item.pattern, "").trim(),
      };
    }
  }

  return {
    prefix: "Dr.",
    name: trimmed,
  };
}

export function validateDoctorProfileForm(
  values: DoctorProfileFormValues,
):
  | { success: true; data: DoctorProfileFormValues }
  | { success: false; errors: DoctorProfileFormErrors } {
  const errors: DoctorProfileFormErrors = {};
  const { name: cleanName } = extractDoctorPrefixAndName(values.name);
  if (!cleanName) errors.name = "Doctor name is required";
  const specializations = values.specializations
    .map((item) => item.trim())
    .filter(Boolean);
  if (specializations.length === 0) {
    errors.specializations = "Add at least one specialization";
  }
  if (!values.about.trim()) errors.about = "About is required";

  const phoneDigits = values.phone.replace(/\D/g, "");
  if (!phoneDigits) {
    errors.phone = "Phone number is required";
  } else if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
    errors.phone = "Enter a valid 10-digit mobile number";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email";
  }

  if (!values.location.trim()) {
    errors.location = "Location is required";
  } else if (values.location.trim().length > 2000) {
    errors.location = "Location must be 2000 characters or fewer";
  }

  const experienceYears = Number(values.experienceYears);
  if (
    values.experienceYears.trim() === "" ||
    !Number.isInteger(experienceYears) ||
    experienceYears < 0 ||
    experienceYears > 80
  ) {
    errors.experienceYears = "Enter experience years between 0 and 80";
  }

  if (!values.state.trim() || !isIndiaState(values.state.trim())) {
    errors.state = "Select a valid Indian state";
  }

  if (!values.city.trim()) {
    errors.city = "City is required";
  } else if (values.city.trim().length > 120) {
    errors.city = "City must be 120 characters or fewer";
  }

  if (!values.photoUrl.trim()) {
    errors.photoUrl = "Doctor photo is required";
  }

  if (values.order.trim() !== "") {
    const order = Number(values.order);
    if (!Number.isInteger(order) || order < 0) {
      errors.order = "Order must be a non-negative integer";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      ...values,
      prefix: values.prefix || "Dr.",
      name: cleanName,
      specializations,
      about: values.about.trim(),
      phone: phoneDigits,
      email: values.email.trim().toLowerCase(),
      location: values.location.trim(),
      education: values.education.trim(),
      degree: values.degree.trim(),
      workHistory: values.workHistory.trim(),
      workDays: values.workDays.trim(),
      state: values.state.trim(),
      city: values.city.trim(),
    },
  };
}

export function toDoctorProfilePayload(
  values: DoctorProfileFormValues,
  fallbackOrder: number,
): DoctorProfilePayload {
  const { prefix: detectedPrefix, name: cleanName } = extractDoctorPrefixAndName(values.name);
  const prefix = values.prefix?.trim() || detectedPrefix || "Dr.";
  const fullName = `${prefix} ${cleanName}`.trim();

  return {
    name: fullName,
    specializations: values.specializations.map((item) => item.trim()).filter(Boolean),
    about: values.about.trim(),
    experienceYears: Number(values.experienceYears),
    state: values.state.trim(),
    city: values.city.trim(),
    phone: `+91 ${values.phone.replace(/\D/g, "")}`,
    email: values.email.trim().toLowerCase(),
    location: values.location.trim(),
    education: values.education.trim(),
    degree: values.degree.trim(),
    workHistory: values.workHistory.trim(),
    workDays: values.workDays.trim(),
    photoUrl: values.photoUrl.trim(),
    photoPublicId: values.photoPublicId.trim(),
    active: values.active,
    order:
      values.order.trim() === "" ? fallbackOrder : Number(values.order),
  };
}
