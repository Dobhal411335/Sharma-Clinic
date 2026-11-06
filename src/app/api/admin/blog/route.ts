import { collectionHandlers } from "@/features/cms/handlers";
import {
  blogCreateSchema,
  blogUpdateSchema,
  nameActivePatchSchema,
  parseRecord,
} from "@/features/cms/parse";
import type { JsonRecord } from "@/features/cms/store";

function slugOf(body: JsonRecord): string | undefined {
  return typeof body.slug === "string" ? body.slug : undefined;
}

const handlers = collectionHandlers({
  kind: "blog",
  message: "Blog",
  parse: parseRecord(blogCreateSchema),
  parseUpdate: parseRecord(blogUpdateSchema),
  patch: parseRecord(nameActivePatchSchema),
  slugFrom: slugOf,
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
