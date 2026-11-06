import type {
  DoctorPageConfigDto,
  DoctorPageFormValues,
  DoctorServiceIconKey,
  DoctorServiceItemFormValues,
} from "@/types/admin/doctor-page";

let serviceKeyCounter = 0;

export function createEmptyServiceItem(
  iconKey: DoctorServiceIconKey = "Stethoscope",
): DoctorServiceItemFormValues {
  serviceKeyCounter += 1;
  return {
    key: `service-${Date.now()}-${serviceKeyCounter}`,
    iconKey,
    name: "",
    description: "",
    readMoreUrl: "",
    active: true,
  };
}

export function createEmptyDoctorPageFormValues(): DoctorPageFormValues {
  return {
    aboutHeading: "",
    aboutDescription: "",
    aboutHighlights: [""],
    aboutButtonLabel: "",
    aboutButtonUrl: "",
    aboutImageUrl: "",
    aboutImagePublicId: "",
    aboutSecondaryImageUrl: "",
    aboutSecondaryImagePublicId: "",
    experienceYears: "",
    servicesHeading: "",
    servicesSubheading: "",
    services: [],
  };
}

export function dtoToDoctorPageFormValues(
  dto: DoctorPageConfigDto,
): DoctorPageFormValues {
  return {
    aboutHeading: dto.aboutHeading ?? "",
    aboutDescription: dto.aboutDescription ?? "",
    aboutHighlights:
      dto.aboutHighlights.length > 0 ? [...dto.aboutHighlights] : [""],
    aboutButtonLabel: dto.aboutButtonLabel ?? "",
    aboutButtonUrl: dto.aboutButtonUrl ?? "",
    aboutImageUrl: dto.aboutImageUrl ?? "",
    aboutImagePublicId: dto.aboutImagePublicId ?? "",
    aboutSecondaryImageUrl: dto.aboutSecondaryImageUrl ?? "",
    aboutSecondaryImagePublicId: dto.aboutSecondaryImagePublicId ?? "",
    experienceYears:
      dto.experienceYears === null || dto.experienceYears === undefined
        ? ""
        : String(dto.experienceYears),
    servicesHeading: dto.servicesHeading ?? "",
    servicesSubheading: dto.servicesSubheading ?? "",
    services: dto.services.map((service, index) => ({
      key: service.id || `service-${index}`,
      iconKey: (service.iconKey as DoctorServiceIconKey) || "Stethoscope",
      name: service.name,
      description: service.description,
      readMoreUrl: service.readMoreUrl,
      active: service.active,
    })),
  };
}
