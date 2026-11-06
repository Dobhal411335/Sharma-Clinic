import { singletonHandlers } from "@/features/cms/handlers";
import { parseLoose } from "@/features/cms/parse";

const handlers = singletonHandlers({
  key: "popup-banner",
  message: "Popup banner",
  parse: parseLoose,
  publicRead: true,
  empty: {
    imageUrl: "",
    imagePublicId: "",
    miniHeading: "",
    heading: "",
    subDescription: "",
    buttonLabel: "",
    buttonUrl: "",
    active: false,
  },
});

export const GET = handlers.GET;
export const PUT = handlers.PUT;
