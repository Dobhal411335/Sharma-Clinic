import { singletonHandlers } from "@/features/cms/handlers";
import { parseLoose } from "@/features/cms/parse";

const handlers = singletonHandlers({
  key: "top-advertisement",
  message: "Top advertisement",
  parse: parseLoose,
  empty: { announcements: [], utilityItems: [], benefits: [] },
});

export const GET = handlers.GET;
export const PUT = handlers.PUT;
