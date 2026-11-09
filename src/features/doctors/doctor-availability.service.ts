import "server-only";

import type { Weekday } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type {
  DoctorAvailabilityApplyMode,
  DoctorAvailabilityDto,
  DoctorAvailabilityPayload,
  DoctorAvailabilityWindow,
  WeekdayValue,
} from "@/types/doctors-availability";
import { WEEKDAY_VALUES } from "@/types/doctors-availability";

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function toMinutes(hhmm: string): number {
  const [, h, m] = TIME_RE.exec(hhmm) ?? [];
  return Number(h) * 60 + Number(m);
}

function assertValidWindow(window: DoctorAvailabilityWindow, index: number): void {
  if (!WEEKDAY_VALUES.includes(window.weekday)) {
    throw new Error(`Window ${index + 1}: invalid weekday.`);
  }
  if (!TIME_RE.test(window.startTimeLocal) || !TIME_RE.test(window.endTimeLocal)) {
    throw new Error(`Window ${index + 1}: use HH:mm times (24-hour).`);
  }
  if (toMinutes(window.endTimeLocal) <= toMinutes(window.startTimeLocal)) {
    throw new Error(`Window ${index + 1}: end time must be after start time.`);
  }
  if (
    !Number.isInteger(window.slotDurationMinutes) ||
    window.slotDurationMinutes < 5 ||
    window.slotDurationMinutes > 240
  ) {
    throw new Error(`Window ${index + 1}: slot duration must be 5–240 minutes.`);
  }
  const span = toMinutes(window.endTimeLocal) - toMinutes(window.startTimeLocal);
  if (window.slotDurationMinutes > span) {
    throw new Error(
      `Window ${index + 1}: slot duration cannot exceed the time window.`,
    );
  }
}

function assertNoOverlap(windows: DoctorAvailabilityWindow[]): void {
  const byDay = new Map<WeekdayValue, DoctorAvailabilityWindow[]>();
  for (const window of windows) {
    const list = byDay.get(window.weekday) ?? [];
    list.push(window);
    byDay.set(window.weekday, list);
  }

  for (const [day, list] of byDay) {
    const sorted = [...list].sort(
      (a, b) => toMinutes(a.startTimeLocal) - toMinutes(b.startTimeLocal),
    );
    for (let i = 1; i < sorted.length; i += 1) {
      const prev = sorted[i - 1]!;
      const curr = sorted[i]!;
      if (toMinutes(curr.startTimeLocal) < toMinutes(prev.endTimeLocal)) {
        throw new Error(`${day}: overlapping time windows are not allowed.`);
      }
    }
  }
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfLocalDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function resolveEffectiveRange(applyMode: DoctorAvailabilityApplyMode): {
  effectiveFrom: Date;
  effectiveUntil: Date | null;
} {
  const now = new Date();
  if (applyMode === "MONTH") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const until = endOfLocalDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    return { effectiveFrom: startOfLocalDay(from), effectiveUntil: until };
  }
  // Open-ended weekly recurring pattern starting today.
  return { effectiveFrom: startOfLocalDay(now), effectiveUntil: null };
}

function mapWindow(
  row: {
    id: string;
    weekday: Weekday;
    startTimeLocal: string;
    endTimeLocal: string;
    slotDurationMinutes: number;
    effectiveFrom: Date | null;
    effectiveUntil: Date | null;
    isActive: boolean;
  },
): DoctorAvailabilityDto["windows"][number] {
  return {
    id: row.id,
    weekday: row.weekday as WeekdayValue,
    startTimeLocal: row.startTimeLocal,
    endTimeLocal: row.endTimeLocal,
    slotDurationMinutes: row.slotDurationMinutes,
    effectiveFrom: row.effectiveFrom?.toISOString() ?? null,
    effectiveUntil: row.effectiveUntil?.toISOString() ?? null,
    isActive: row.isActive,
  };
}

export async function getDoctorAvailability(
  doctorId: string,
): Promise<DoctorAvailabilityDto> {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { id: true },
  });
  if (!doctor) throw new Error("Doctor not found.");

  const rows = await prisma.weeklyAvailability.findMany({
    where: { doctorId, isActive: true },
    orderBy: [{ weekday: "asc" }, { startTimeLocal: "asc" }],
  });

  return {
    doctorId,
    windows: rows.map(mapWindow),
  };
}

export async function replaceDoctorAvailability(
  doctorId: string,
  payload: DoctorAvailabilityPayload,
): Promise<DoctorAvailabilityDto> {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { id: true },
  });
  if (!doctor) throw new Error("Doctor not found.");

  const windows = payload.windows ?? [];
  if (windows.length === 0) {
    throw new Error("Add at least one schedule window.");
  }

  windows.forEach(assertValidWindow);
  assertNoOverlap(windows);

  const applyWeekdays = new Set<WeekdayValue>(
    (payload.applyWeekdays?.length
      ? payload.applyWeekdays
      : windows.map((window) => window.weekday)
    ).filter((day) => WEEKDAY_VALUES.includes(day)),
  );
  if (applyWeekdays.size === 0) {
    throw new Error("Select at least one weekday to apply.");
  }

  const filtered = windows.filter((window) => applyWeekdays.has(window.weekday));
  if (filtered.length === 0) {
    throw new Error("No schedule windows match the selected weekdays.");
  }

  const { effectiveFrom, effectiveUntil } = resolveEffectiveRange(payload.applyMode);

  await prisma.$transaction(async (tx) => {
    await tx.weeklyAvailability.updateMany({
      where: { doctorId, isActive: true },
      data: { isActive: false },
    });

    await tx.weeklyAvailability.createMany({
      data: filtered.map((window) => ({
        doctorId,
        weekday: window.weekday as Weekday,
        startTimeLocal: window.startTimeLocal,
        endTimeLocal: window.endTimeLocal,
        slotDurationMinutes: window.slotDurationMinutes,
        effectiveFrom,
        effectiveUntil,
        isActive: true,
      })),
    });
  });

  return getDoctorAvailability(doctorId);
}

/** Active windows for public display (ignores expired month ranges). */
export async function listPublicDoctorAvailability(
  doctorId: string,
): Promise<DoctorAvailabilityDto["windows"]> {
  const now = new Date();
  const rows = await prisma.weeklyAvailability.findMany({
    where: {
      doctorId,
      isActive: true,
      AND: [
        { OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: now } }] },
        { OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: now } }] },
      ],
    },
    orderBy: [{ weekday: "asc" }, { startTimeLocal: "asc" }],
  });
  return rows.map(mapWindow);
}

export async function resolveDoctorIdForUser(userId: string): Promise<string | null> {
  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    select: { id: true },
  });
  return doctor?.id ?? null;
}
