import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export const CLINIC_SITE_CODE = "IN" as const;

const LIST_KEYS = new Set([
  "sections",
  "items",
  "columns",
  "links",
  "slides",
  "gridImages",
  "cards",
  "services",
  "highlights",
  "subSections",
  "aboutCards",
  "highlightItems",
  "textSlides",
  "announcements",
  "utilityItems",
  "benefits",
  "accordionItems",
]);

export type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function stampValue(value: unknown, key?: string): unknown {
  if (Array.isArray(value)) {
    if (key && LIST_KEYS.has(key)) {
      return value.map((item) => {
        if (!isRecord(item)) return stampValue(item);
        const next: JsonRecord = { ...item };
        if (typeof next.id !== "string" || next.id.trim() === "") {
          next.id = crypto.randomUUID();
        }
        return stampObject(next);
      });
    }
    return value.map((item) => stampValue(item));
  }
  if (isRecord(value)) return stampObject(value);
  return value;
}

function stampObject(record: JsonRecord): JsonRecord {
  const next: JsonRecord = {};
  for (const [key, value] of Object.entries(record)) {
    next[key] = stampValue(value, key);
  }
  return next;
}

export function stampIds(record: JsonRecord): JsonRecord {
  return stampObject(record);
}

function toInput(record: JsonRecord): Prisma.InputJsonValue {
  return stampIds(record) as Prisma.InputJsonValue;
}

function sortOrderOf(record: JsonRecord): number {
  const raw = record.order ?? record.sortOrder ?? 0;
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) ? value : 0;
}

export async function readSingleton(key: string): Promise<{
  payload: JsonRecord;
  updatedAt: string;
} | null> {
  const row = await prisma.cmsSingleton.findUnique({ where: { key } });
  if (!row) return null;
  return {
    payload: asRecord(row.payload),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function writeSingleton(key: string, payload: JsonRecord): Promise<{
  payload: JsonRecord;
  updatedAt: string;
}> {
  const row = await prisma.cmsSingleton.upsert({
    where: { key },
    create: { key, payload: toInput(payload) },
    update: { payload: toInput(payload) },
  });
  return {
    payload: asRecord(row.payload),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export type StoredItem = JsonRecord & {
  id: string;
  siteCode: typeof CLINIC_SITE_CODE;
  createdAt: string;
  updatedAt: string;
};

function toItem(row: {
  id: string;
  payload: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): StoredItem {
  return {
    ...asRecord(row.payload),
    id: row.id,
    siteCode: CLINIC_SITE_CODE,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listItems(kind: string): Promise<StoredItem[]> {
  const rows = await prisma.cmsItem.findMany({
    where: { kind },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toItem);
}

export async function getItem(kind: string, id: string): Promise<StoredItem | null> {
  const row = await prisma.cmsItem.findFirst({ where: { id, kind } });
  return row ? toItem(row) : null;
}

export async function createItem(kind: string, payload: JsonRecord): Promise<StoredItem> {
  const stamped = stampIds(payload);
  const row = await prisma.cmsItem.create({
    data: {
      kind,
      payload: stamped as Prisma.InputJsonValue,
      sortOrder: sortOrderOf(stamped),
    },
  });
  return toItem(row);
}

export async function replaceItem(
  kind: string,
  id: string,
  payload: JsonRecord,
): Promise<StoredItem | null> {
  const existing = await prisma.cmsItem.findFirst({ where: { id, kind } });
  if (!existing) return null;
  const stamped = stampIds(payload);
  const row = await prisma.cmsItem.update({
    where: { id },
    data: {
      payload: stamped as Prisma.InputJsonValue,
      sortOrder: sortOrderOf(stamped),
    },
  });
  return toItem(row);
}

export async function mergeItem(
  kind: string,
  id: string,
  patch: JsonRecord,
): Promise<StoredItem | null> {
  const existing = await prisma.cmsItem.findFirst({ where: { id, kind } });
  if (!existing) return null;
  const next = stampIds({ ...asRecord(existing.payload), ...patch });
  const row = await prisma.cmsItem.update({
    where: { id },
    data: {
      payload: next as Prisma.InputJsonValue,
      sortOrder: sortOrderOf(next),
    },
  });
  return toItem(row);
}

export async function removeItem(kind: string, id: string): Promise<boolean> {
  const existing = await prisma.cmsItem.findFirst({ where: { id, kind } });
  if (!existing) return false;
  await prisma.cmsItem.delete({ where: { id } });
  return true;
}

export function withSite<T extends JsonRecord>(
  payload: T,
  meta?: { id?: string | null; updatedAt?: string | null },
): T & { id: string | null; siteCode: typeof CLINIC_SITE_CODE; updatedAt: string | null } {
  return {
    ...payload,
    id: meta?.id ?? null,
    siteCode: CLINIC_SITE_CODE,
    updatedAt: meta?.updatedAt ?? null,
  };
}
