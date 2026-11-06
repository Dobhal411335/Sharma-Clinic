import { singletonHandlers } from "@/features/cms/handlers";
import { parseLoose } from "@/features/cms/parse";

const handlers = singletonHandlers({
  key: "doctor-page",
  message: "Doctor page",
  parse: parseLoose,
  empty: {
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
  },
});

export const GET = handlers.GET;
export const PUT = handlers.PUT;
