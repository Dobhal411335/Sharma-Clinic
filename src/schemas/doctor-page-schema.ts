import {
  DOCTOR_SERVICE_ICON_OPTIONS,
  type DoctorPageFormValues,
  type DoctorPagePayload,
  type DoctorServiceIconKey,
} from "@/types/admin/doctor-page";

export type DoctorPageFormErrors = {
  aboutHeading?: string;
  aboutDescription?: string;
  aboutButtonLabel?: string;
  aboutButtonUrl?: string;
  aboutImageUrl?: string;
  experienceYears?: string;
  servicesHeading?: string;
  servicesSubheading?: string;
  services?: string;
  highlights?: string;
};

function isAllowedIcon(value: string): value is DoctorServiceIconKey {
  return (DOCTOR_SERVICE_ICON_OPTIONS as readonly string[]).includes(value);
}

export function validateDoctorPageForm(
  values: DoctorPageFormValues,
):
  | { success: true; data: DoctorPageFormValues }
  | { success: false; errors: DoctorPageFormErrors } {
  const errors: DoctorPageFormErrors = {};

  if (values.experienceYears.trim() !== "") {
    const years = Number(values.experienceYears);
    if (!Number.isInteger(years) || years < 0 || years > 100) {
      errors.experienceYears = "Experience years must be between 0 and 100";
    }
  }

  for (const service of values.services) {
    if (!service.name.trim() || !service.description.trim()) {
      errors.services = "Each service needs a name and description";
      break;
    }
    if (!isAllowedIcon(service.iconKey)) {
      errors.services = "Each service needs a valid Lucide icon";
      break;
    }
  }

  const highlights = values.aboutHighlights.map((item) => item.trim()).filter(Boolean);
  if (highlights.length > 20) {
    errors.highlights = "At most 20 highlights are allowed";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      ...values,
      aboutHeading: values.aboutHeading.trim(),
      aboutDescription: values.aboutDescription.trim(),
      aboutHighlights: highlights,
      aboutButtonLabel: values.aboutButtonLabel.trim(),
      aboutButtonUrl: values.aboutButtonUrl.trim(),
      servicesHeading: values.servicesHeading.trim(),
      servicesSubheading: values.servicesSubheading.trim(),
      services: values.services.map((service) => ({
        ...service,
        name: service.name.trim(),
        description: service.description.trim(),
        readMoreUrl: service.readMoreUrl.trim(),
      })),
    },
  };
}

export function toDoctorPagePayload(values: DoctorPageFormValues): DoctorPagePayload {
  return {
    aboutHeading: values.aboutHeading.trim(),
    aboutDescription: values.aboutDescription.trim(),
    aboutHighlights: values.aboutHighlights.map((item) => item.trim()).filter(Boolean),
    aboutButtonLabel: values.aboutButtonLabel.trim(),
    aboutButtonUrl: values.aboutButtonUrl.trim(),
    aboutImageUrl: values.aboutImageUrl.trim(),
    aboutImagePublicId: values.aboutImagePublicId.trim(),
    aboutSecondaryImageUrl: values.aboutSecondaryImageUrl.trim(),
    aboutSecondaryImagePublicId: values.aboutSecondaryImagePublicId.trim(),
    experienceYears:
      values.experienceYears.trim() === ""
        ? null
        : Number(values.experienceYears),
    servicesHeading: values.servicesHeading.trim(),
    servicesSubheading: values.servicesSubheading.trim(),
    services: values.services.map((service, index) => ({
      iconKey: service.iconKey,
      name: service.name.trim(),
      description: service.description.trim(),
      readMoreUrl: service.readMoreUrl.trim(),
      active: service.active,
      order: index,
    })),
  };
}
