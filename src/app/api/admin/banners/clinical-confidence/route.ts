import { singletonHandlers } from "@/features/cms/handlers";
import { parseLoose } from "@/features/cms/parse";

const handlers = singletonHandlers({
  key: "clinical-confidence",
  message: "Clinical confidence",
  parse: parseLoose,
  empty: {
    badgeText: "",
    heading: "",
    description: "",
    button1Label: "",
    button1Url: "",
    button2Label: "",
    button2Url: "",
    backgroundImageUrl: "",
    backgroundImagePublicId: "",
    cards: [],
  },
});

export const GET = handlers.GET;
export const PUT = handlers.PUT;
