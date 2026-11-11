import "server-only";

import type { Weekday } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { WeekdayValue } from "@/types/doctors-availability";

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const WEEKDAY_FROM_UTC_DAY: WeekdayValue[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const ACTIVE_BOOKING_STATUSES = [
  "PENDING_PAYMENT",
  "PENDING",
  "ACCEPTED",
] as const;

function toMinutes(hhmm: string): number {
  const [, h, m] = TIME_RE.exec(hhmm) ?? [];
  return Number(h) * 60 + Number(m);
}

function minutesToHhmm(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Clinic-local wall clock → UTC instant (Asia/Kolkata fixed offset). */
function clinicLocalToUtc(isoDate: string, hhmm: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  const [hour, minute] = hhmm.split(":").map(Number);
  const offsetMinutes = 5 * 60 + 30;
  return new Date(
    Date.UTC(year, month - 1, day, hour, minute, 0) - offsetMinutes * 60 * 1000,
  );
}

export type BookableSlot = {
  startsAt: string;
  endsAt: string;
  label: string;
};

/**
 * Expand weekly windows into free slots for a clinic-local calendar day.
 * Excludes past times and slots overlapping PENDING_PAYMENT|PENDING|ACCEPTED.
 */
export async function listBookableSlots(input: {
  doctorId: string;
  /** YYYY-MM-DD in clinic timezone */
  date: string;
}): Promise<BookableSlot[]> {
  const date = input.date.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("date must be YYYY-MM-DD.");
  }

  const doctor = await prisma.doctor.findFirst({
    where: { id: input.doctorId, isActive: true },
    select: { id: true },
  });
  if (!doctor) throw new Error("Doctor not found.");

  const dayStart = clinicLocalToUtc(date, "00:00");
  const weekdayProbe = clinicLocalToUtc(date, "12:00");
  const weekday = WEEKDAY_FROM_UTC_DAY[weekdayProbe.getUTCDay()]!;

  const now = new Date();
  const windows = await prisma.weeklyAvailability.findMany({
    where: {
      doctorId: doctor.id,
      weekday: weekday as Weekday,
      isActive: true,
      AND: [
        { OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: now } }] },
        { OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: now } }] },
      ],
    },
    orderBy: { startTimeLocal: "asc" },
  });

  if (windows.length === 0) return [];

  const exceptions = await prisma.availabilityException.findMany({
    where: {
      doctorId: doctor.id,
      date: dayStart,
    },
  });
  // Full-day unavailability: UNAVAILABLE with no partial time window.
  if (
    exceptions.some(
      (item) =>
        item.type === "UNAVAILABLE" &&
        !item.startTimeLocal &&
        !item.endTimeLocal,
    )
  ) {
    return [];
  }

  const booked = await prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      status: { in: [...ACTIVE_BOOKING_STATUSES] },
      startsAt: { lt: clinicLocalToUtc(date, "23:59") },
      endsAt: { gt: clinicLocalToUtc(date, "00:00") },
    },
    select: { startsAt: true, endsAt: true },
  });

  const slots: BookableSlot[] = [];
  for (const window of windows) {
    const startMin = toMinutes(window.startTimeLocal);
    const endMin = toMinutes(window.endTimeLocal);
    const duration = window.slotDurationMinutes;
    for (let cursor = startMin; cursor + duration <= endMin; cursor += duration) {
      const slotStartLocal = minutesToHhmm(cursor);
      const slotEndLocal = minutesToHhmm(cursor + duration);
      const startsAt = clinicLocalToUtc(date, slotStartLocal);
      const endsAt = clinicLocalToUtc(date, slotEndLocal);
      if (startsAt <= now) continue;

      const overlaps = booked.some(
        (row) => row.startsAt < endsAt && row.endsAt > startsAt,
      );
      if (overlaps) continue;

      slots.push({
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        label: `${slotStartLocal} – ${slotEndLocal}`,
      });
    }
  }

  return slots;
}

/** Server-side slot validation for booking create. */
export async function assertSlotIsBookable(input: {
  doctorId: string;
  startsAt: Date;
  endsAt: Date;
}): Promise<void> {
  if (!(input.startsAt instanceof Date) || Number.isNaN(input.startsAt.getTime())) {
    throw new Error("Invalid appointment start time.");
  }
  if (input.endsAt <= input.startsAt) {
    throw new Error("Invalid appointment end time.");
  }
  if (input.startsAt <= new Date()) {
    throw new Error("That time slot is in the past.");
  }

  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(input.startsAt);

  const slots = await listBookableSlots({
    doctorId: input.doctorId,
    date,
  });
  const match = slots.some(
    (slot) =>
      slot.startsAt === input.startsAt.toISOString() &&
      slot.endsAt === input.endsAt.toISOString(),
  );
  if (!match) {
    throw new Error("That time slot is not available.");
  }
}
