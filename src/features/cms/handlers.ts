import { ZodError } from "zod";

import {
  jsonData,
  jsonMessage,
  readJson,
  requestId,
  requireCmsAdmin,
  zodMessage,
} from "@/features/cms/http";
import { slugify } from "@/features/cms/parse";
import {
  CLINIC_SITE_CODE,
  createItem,
  getItem,
  listItems,
  mergeItem,
  readSingleton,
  removeItem,
  replaceItem,
  withSite,
  writeSingleton,
  type JsonRecord,
} from "@/features/cms/store";

function stripMeta(body: JsonRecord): JsonRecord {
  const next = { ...body };
  delete next.id;
  delete next.siteCode;
  delete next.createdAt;
  delete next.updatedAt;
  return next;
}

async function uniqueSlug(kind: string, slug: string, exceptId?: string): Promise<string> {
  const items = await listItems(kind);
  const taken = new Set(
    items.filter((item) => item.id !== exceptId).map((item) => String(item.slug ?? "")),
  );
  if (!taken.has(slug)) return slug;
  let suffix = 2;
  while (taken.has(`${slug}-${suffix}`)) suffix += 1;
  return `${slug}-${suffix}`;
}

export function singletonHandlers(options: {
  key: string;
  empty: JsonRecord;
  parse: (body: unknown) => JsonRecord;
  message: string;
  afterSave?: (previous: JsonRecord | null, next: JsonRecord) => Promise<void>;
  /** When true, anonymous visitors can read the document. Writes stay admin-only. */
  publicRead?: boolean;
}) {
  return {
    async GET() {
      if (!options.publicRead) {
        const authResult = await requireCmsAdmin();
        if (!authResult.ok) return authResult.response;
      }
      const row = await readSingleton(options.key);
      if (!row) return jsonData(withSite(options.empty), options.message);
      return jsonData(
        withSite(row.payload, { id: options.key, updatedAt: row.updatedAt }),
        options.message,
      );
    },
    async PUT(request: Request) {
      const authResult = await requireCmsAdmin();
      if (!authResult.ok) return authResult.response;
      const payload = await readJson(request);
      if (!payload.ok) return payload.response;
      try {
        const previous = await readSingleton(options.key);
        const parsed = stripMeta(options.parse(payload.body));
        const saved = await writeSingleton(options.key, parsed);
        if (options.afterSave) {
          await options.afterSave(previous?.payload ?? null, saved.payload);
        }
        return jsonData(
          withSite(saved.payload, { id: options.key, updatedAt: saved.updatedAt }),
          "Saved",
        );
      } catch (error) {
        if (error instanceof ZodError) return jsonMessage(400, zodMessage(error));
        throw error;
      }
    },
  };
}

export function collectionHandlers(options: {
  kind: string;
  parse: (body: unknown) => JsonRecord;
  parseUpdate?: (body: unknown) => JsonRecord;
  patch?: (body: unknown) => JsonRecord;
  message: string;
  slugFrom?: (body: JsonRecord) => string | undefined;
  /** Keep fields the update body does not send (webpage content saves). */
  mergeUpdate?: boolean;
}) {
  return {
    async GET(request: Request) {
      const authResult = await requireCmsAdmin();
      if (!authResult.ok) return authResult.response;
      const id = requestId(request);
      if (id) {
        const item = await getItem(options.kind, id);
        if (!item) return jsonMessage(404, "Not found");
        return jsonData(item, options.message);
      }
      const items = await listItems(options.kind);
      return jsonData(items, options.message);
    },
    async POST(request: Request) {
      const authResult = await requireCmsAdmin();
      if (!authResult.ok) return authResult.response;
      const payload = await readJson(request);
      if (!payload.ok) return payload.response;
      try {
        const parsed = stripMeta(options.parse(payload.body));
        if (options.slugFrom) {
          const base = options.slugFrom(parsed) || slugify(String(parsed.name ?? parsed.title ?? ""));
          parsed.slug = await uniqueSlug(options.kind, base);
        }
        const created = await createItem(options.kind, parsed);
        return jsonData(created, "Created", 201);
      } catch (error) {
        if (error instanceof ZodError) return jsonMessage(400, zodMessage(error));
        throw error;
      }
    },
    async PUT(request: Request) {
      const authResult = await requireCmsAdmin();
      if (!authResult.ok) return authResult.response;
      const payload = await readJson(request);
      if (!payload.ok) return payload.response;
      const id = requestId(request);
      if (!id) return jsonMessage(400, "id is required");
      try {
        const parsed = stripMeta((options.parseUpdate ?? options.parse)(payload.body));
        if (options.slugFrom) {
          const base = options.slugFrom(parsed);
          if (base) parsed.slug = await uniqueSlug(options.kind, base, id);
        }
        const updated = options.mergeUpdate
          ? await mergeItem(options.kind, id, parsed)
          : await replaceItem(options.kind, id, parsed);
        if (!updated) return jsonMessage(404, "Not found");
        return jsonData(updated, "Saved");
      } catch (error) {
        if (error instanceof ZodError) return jsonMessage(400, zodMessage(error));
        throw error;
      }
    },
    async PATCH(request: Request) {
      const authResult = await requireCmsAdmin();
      if (!authResult.ok) return authResult.response;
      const payload = await readJson(request);
      if (!payload.ok) return payload.response;
      const id = requestId(request);
      if (!id) return jsonMessage(400, "id is required");
      try {
        const parsed = options.patch ? options.patch(payload.body) : stripMeta(options.parse(payload.body));
        const updated = await mergeItem(options.kind, id, stripMeta(parsed));
        if (!updated) return jsonMessage(404, "Not found");
        return jsonData(updated, "Saved");
      } catch (error) {
        if (error instanceof ZodError) return jsonMessage(400, zodMessage(error));
        throw error;
      }
    },
    async DELETE(request: Request) {
      const authResult = await requireCmsAdmin();
      if (!authResult.ok) return authResult.response;
      const id = requestId(request);
      if (!id) return jsonMessage(400, "id is required");
      const removed = await removeItem(options.kind, id);
      if (!removed) return jsonMessage(404, "Not found");
      return jsonData({ id, siteCode: CLINIC_SITE_CODE }, "Deleted");
    },
  };
}
