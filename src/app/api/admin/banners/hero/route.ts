import { singletonHandlers } from "@/features/cms/handlers";
import { parseLoose } from "@/features/cms/parse";

const handlers = singletonHandlers({
  key: "hero-banner",
  message: "Hero banner",
  parse: parseLoose,
  empty: { slides: [] },
});

export const GET = handlers.GET;
export const PUT = handlers.PUT;
