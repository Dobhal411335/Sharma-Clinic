import { singletonHandlers } from "@/features/cms/handlers";
import { parseLoose } from "@/features/cms/parse";

const handlers = singletonHandlers({
  key: "about-us-banner",
  message: "About us banner",
  parse: parseLoose,
  empty: {
    promoLabel: "",
    promoHeading: "",
    promoDescription: "",
    promoSubheading: "",
    promoButtonLabel: "",
    promoButtonUrl: "",
    servicesHeading: "",
    servicesViewAllLabel: "",
    servicesViewAllUrl: "",
    aboutCards: [],
    highlightItems: [],
    textSlides: [],
    services: [],
  },
});

export const GET = handlers.GET;
export const PUT = handlers.PUT;
