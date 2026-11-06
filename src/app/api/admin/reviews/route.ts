import { collectionHandlers } from "@/features/cms/handlers";
import { activeOrderPatchSchema, parseRecord, reviewBodySchema } from "@/features/cms/parse";

const handlers = collectionHandlers({
  kind: "review",
  message: "Reviews",
  parse: parseRecord(reviewBodySchema),
  patch: parseRecord(activeOrderPatchSchema),
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
