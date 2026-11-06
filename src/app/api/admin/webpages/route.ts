import { collectionHandlers } from "@/features/cms/handlers";
import {
  parseLoose,
  parseRecord,
  webpageCreateSchema,
  webpageMetaPatchSchema,
} from "@/features/cms/parse";
import type { JsonRecord } from "@/features/cms/store";

function slugOf(body: JsonRecord): string | undefined {
  return typeof body.slug === "string" ? body.slug : undefined;
}

const handlers = collectionHandlers({
  kind: "webpage",
  message: "Webpages",
  parse: parseRecord(webpageCreateSchema),
  parseUpdate: parseLoose,
  patch: parseRecord(webpageMetaPatchSchema),
  slugFrom: slugOf,
  mergeUpdate: true,
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
