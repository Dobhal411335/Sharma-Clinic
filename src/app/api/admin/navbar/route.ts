import { collectionHandlers } from "@/features/cms/handlers";
import { activePatchSchema, navbarBodySchema, parseRecord } from "@/features/cms/parse";

const handlers = collectionHandlers({
  kind: "navbar",
  message: "Navbar",
  parse: parseRecord(navbarBodySchema),
  patch: parseRecord(activePatchSchema),
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
