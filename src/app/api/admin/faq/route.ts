import { singletonHandlers } from "@/features/cms/handlers";
import { parseLoose } from "@/features/cms/parse";

const handlers = singletonHandlers({
  key: "faq",
  message: "FAQ",
  parse: parseLoose,
  empty: { sections: [] },
});

export const GET = handlers.GET;
export const PUT = handlers.PUT;
