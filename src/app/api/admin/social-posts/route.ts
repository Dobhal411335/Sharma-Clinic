import { collectionHandlers } from "@/features/cms/handlers";
import { activeOrderPatchSchema, parseRecord, socialBodySchema } from "@/features/cms/parse";

const handlers = collectionHandlers({
  kind: "social-post",
  message: "Social posts",
  parse: parseRecord(socialBodySchema),
  patch: parseRecord(activeOrderPatchSchema),
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
