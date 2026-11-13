import "server-only";

import type { AvailabilityScope, Weekday } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type {
  AvailabilityScopeValue,
  DoctorAvailabilityApplyMode,
  DoctorAvailabilityDto,
  DoctorAvailabilityDtoWindow,
  DoctorAvailabilityPayload,
  DoctorAvailabilityWindow,
  DoctorWeekSchedule,
  WeekdayValue,
} from "@/types/doctors-availability";
import { WEEKDAY_VALUES } from "@/types/doctors-availability";

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const SCOPE_PRIORITY: Record<AvailabilityScopeValue, number> = {
  CUSTOM: 3,
  TEMPORARY: 2,
  FIXED: 1,
};

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

function parseIsoDate(value: string, label: string): Date {
  if (!DATE_RE.test(value)) {
    throw new Error(`${label} must be YYYY-MM-DD.`);
  }
  const [y, m, d] = value.split("-").map(Number);
  return startOfLocalDay(new Date(y, m - 1, d));
}

function clinicTodayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days));
  return utc.toISOString().slice(0, 10);
}

function weekdayFromIsoDate(isoDate: string): WeekdayValue {
  const [y, m, d] = isoDate.split("-").map(Number);
  const utcDay = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
  const map: WeekdayValue[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return map[utcDay]!;
}

function mondayOfWeekContaining(isoDate: string): string {
  const weekday = weekdayFromIsoDate(isoDate);
  const index = WEEKDAY_VALUES.indexOf(weekday);
  return addDaysIso(isoDate, -index);
}

function resolveEffectiveRange(input: {
  scope: AvailabilityScopeValue;
  applyMode: DoctorAvailabilityApplyMode;
  repeatCount?: number;
  untilDate?: string;
  rangeStart?: string;
  rangeEnd?: string;
}): {
  effectiveFrom: Date | null;
  effectiveUntil: Date | null;
} {
  const now = new Date();
  const today = startOfLocalDay(now);

  if (input.scope === "FIXED") {
    // Open-ended lifetime pattern: covers any calendar date until deactivated.
    return { effectiveFrom: null, effectiveUntil: null };
  }

  if (input.scope === "CUSTOM" || input.applyMode === "DATE_RANGE") {
    const start = parseIsoDate(input.rangeStart ?? "", "rangeStart");
    const end = parseIsoDate(input.rangeEnd ?? "", "rangeEnd");
    if (end < start) {
      throw new Error("Custom range end must be on or after the start date.");
    }
    return { effectiveFrom: start, effectiveUntil: endOfLocalDay(end) };
  }

  if (input.applyMode === "MONTH") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const until = endOfLocalDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    return { effectiveFrom: startOfLocalDay(from), effectiveUntil: until };
  }

  if (input.applyMode === "WEEK") {
    const weekStart = mondayOfWeekContaining(clinicTodayIso());
    const weekEnd = addDaysIso(weekStart, 6);
    return {
      effectiveFrom: parseIsoDate(weekStart, "weekStart"),
      effectiveUntil: endOfLocalDay(parseIsoDate(weekEnd, "weekEnd")),
    };
  }

  if (input.applyMode === "NEXT_WEEKS") {
    const count = Number(input.repeatCount);
    if (!Number.isInteger(count) || count < 1 || count > 52) {
      throw new Error("repeatCount must be between 1 and 52 weeks.");
    }
    const weekStart = mondayOfWeekContaining(clinicTodayIso());
    const weekEnd = addDaysIso(weekStart, count * 7 - 1);
    return {
      effectiveFrom: parseIsoDate(weekStart, "weekStart"),
      effectiveUntil: endOfLocalDay(parseIsoDate(weekEnd, "weekEnd")),
    };
  }

  if (input.applyMode === "NEXT_MONTHS") {
    const count = Number(input.repeatCount);
    if (!Number.isInteger(count) || count < 1 || count > 24) {
      throw new Error("repeatCount must be between 1 and 24 months.");
    }
    const from = startOfLocalDay(new Date(now.getFullYear(), now.getMonth(), 1));
    const until = endOfLocalDay(
      new Date(now.getFullYear(), now.getMonth() + count, 0),
    );
    return { effectiveFrom: from, effectiveUntil: until };
  }

  if (input.applyMode === "UNTIL_DATE") {
    const until = parseIsoDate(input.untilDate ?? "", "untilDate");
    if (until < today) {
      throw new Error("untilDate must be today or later.");
    }
    return { effectiveFrom: today, effectiveUntil: endOfLocalDay(until) };
  }

  throw new Error("Unsupported schedule apply mode.");
}

function mapWindow(row: {
  id: string;
  weekday: Weekday;
  startTimeLocal: string;
  endTimeLocal: string;
  slotDurationMinutes: number;
  scope: AvailabilityScope;
  effectiveFrom: Date | null;
  effectiveUntil: Date | null;
  isActive: boolean;
}): DoctorAvailabilityDtoWindow {
  return {
    id: row.id,
    weekday: row.weekday as WeekdayValue,
    startTimeLocal: row.startTimeLocal,
    endTimeLocal: row.endTimeLocal,
    slotDurationMinutes: row.slotDurationMinutes,
    scope: row.scope as AvailabilityScopeValue,
    effectiveFrom: row.effectiveFrom?.toISOString() ?? null,
    effectiveUntil: row.effectiveUntil?.toISOString() ?? null,
    isActive: row.isActive,
  };
}

function coversDate(
  row: {
    effectiveFrom: Date | null;
    effectiveUntil: Date | null;
  },
  dayStart: Date,
  dayEnd: Date,
): boolean {
  if (row.effectiveFrom && row.effectiveFrom > dayEnd) return false;
  if (row.effectiveUntil && row.effectiveUntil < dayStart) return false;
  return true;
}

function pickWinningScope(
  rows: Array<{ scope: AvailabilityScope }>,
): AvailabilityScopeValue | null {
  let winner: AvailabilityScopeValue | null = null;
  let best = 0;
  for (const row of rows) {
    const scope = row.scope as AvailabilityScopeValue;
    const score = SCOPE_PRIORITY[scope] ?? 0;
    if (score > best) {
      best = score;
      winner = scope;
    }
  }
  return winner;
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
    orderBy: [{ scope: "asc" }, { weekday: "asc" }, { startTimeLocal: "asc" }],
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

  const scope = payload.scope ?? "FIXED";
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

  const applyMode: DoctorAvailabilityApplyMode =
    scope === "FIXED"
      ? "WEEK"
      : scope === "CUSTOM"
        ? "DATE_RANGE"
        : payload.applyMode;

  const { effectiveFrom, effectiveUntil } = resolveEffectiveRange({
    scope,
    applyMode,
    repeatCount: payload.repeatCount,
    untilDate: payload.untilDate,
    rangeStart: payload.rangeStart,
    rangeEnd: payload.rangeEnd,
  });

  await prisma.$transaction(async (tx) => {
    await tx.weeklyAvailability.updateMany({
      where: { doctorId, isActive: true, scope },
      data: { isActive: false },
    });

    await tx.weeklyAvailability.createMany({
      data: filtered.map((window) => ({
        doctorId,
        weekday: window.weekday as Weekday,
        startTimeLocal: window.startTimeLocal,
        endTimeLocal: window.endTimeLocal,
        slotDurationMinutes: window.slotDurationMinutes,
        scope,
        effectiveFrom,
        effectiveUntil,
        isActive: true,
      })),
    });
  });

  return getDoctorAvailability(doctorId);
}

/** Active windows currently in force (any scope still covering now). */
export async function listPublicDoctorAvailability(
  doctorId: string,
): Promise<DoctorAvailabilityDtoWindow[]> {
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

/**
 * Windows that apply to a specific clinic-local date, after scope priority
 * (Custom > Temporary > Fixed).
 */
export async function listWindowsForDate(input: {
  doctorId: string;
  /** YYYY-MM-DD clinic-local */
  date: string;
}): Promise<DoctorAvailabilityDtoWindow[]> {
  if (!DATE_RE.test(input.date)) {
    throw new Error("date must be YYYY-MM-DD.");
  }
  const dayStart = parseIsoDate(input.date, "date");
  const dayEnd = endOfLocalDay(dayStart);
  const weekday = weekdayFromIsoDate(input.date);

  const rows = await prisma.weeklyAvailability.findMany({
    where: {
      doctorId: input.doctorId,
      weekday: weekday as Weekday,
      isActive: true,
    },
    orderBy: { startTimeLocal: "asc" },
  });

  const covering = rows.filter((row) => coversDate(row, dayStart, dayEnd));
  const winner = pickWinningScope(covering);
  if (!winner) return [];

  return covering.filter((row) => row.scope === winner).map(mapWindow);
}

function clinicLocalHmmFromIso(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).formatToParts(new Date(iso));
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

export async function buildDoctorWeekSchedule(input: {
  doctorId: string;
  doctorSlug: string;
  /** Optional YYYY-MM-DD start; defaults to clinic today (rolling 7 days). */
  weekStart?: string;
}): Promise<DoctorWeekSchedule> {
  // Dynamic import avoids circular dependency with bookable-slots.service.
  const { listBookableSlots } = await import(
    "@/features/doctors/bookable-slots.service"
  );

  const today = clinicTodayIso();
  // Rolling next 7 days from today (e.g. Thu → Thu…Wed), not calendar Mon–Sun.
  const weekStart =
    input.weekStart && DATE_RE.test(input.weekStart) && input.weekStart >= today
      ? input.weekStart
      : today;
  const weekEnd = addDaysIso(weekStart, 6);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDaysIso(weekStart, index);
    const weekday = weekdayFromIsoDate(date);
    return {
      date,
      weekday,
      label: weekday.slice(0, 3),
    };
  });

  const dayWindows = await Promise.all(
    days.map(async (day) => {
      const [windows, slots] = await Promise.all([
        listWindowsForDate({
          doctorId: input.doctorId,
          date: day.date,
        }),
        listBookableSlots({
          doctorId: input.doctorId,
          date: day.date,
        }).catch(() => []),
      ]);

      return {
        ...day,
        windows: windows.map((window) => {
          const windowStart = toMinutes(window.startTimeLocal);
          const windowEnd = toMinutes(window.endTimeLocal);
          const freeInWindow = slots.filter((slot) => {
            const start = toMinutes(clinicLocalHmmFromIso(slot.startsAt));
            const end = toMinutes(clinicLocalHmmFromIso(slot.endsAt));
            return start >= windowStart && end <= windowEnd;
          });
          const nextSlotStart =
            freeInWindow.length > 0
              ? clinicLocalHmmFromIso(freeInWindow[0]!.startsAt)
              : null;
          const available = freeInWindow.length > 0 && Boolean(nextSlotStart);

          return {
            date: day.date,
            weekday: day.weekday,
            startTimeLocal: window.startTimeLocal,
            endTimeLocal: window.endTimeLocal,
            scope: window.scope,
            slotsRemaining: freeInWindow.length,
            nextSlotStart,
            available,
            // Deep-link the first free patient slot (not just the window open time).
            href: available
              ? `/book-appointment/${input.doctorSlug}?date=${encodeURIComponent(day.date)}&start=${encodeURIComponent(nextSlotStart!)}`
              : "",
          };
        }),
      };
    }),
  );

  const timeRowSet = new Set<string>();
  for (const day of dayWindows) {
    for (const window of day.windows) {
      timeRowSet.add(`${window.startTimeLocal}-${window.endTimeLocal}`);
    }
  }
  const timeRows = [...timeRowSet].sort((a, b) => {
    const [aStart] = a.split("-");
    const [bStart] = b.split("-");
    return toMinutes(aStart!) - toMinutes(bStart!);
  });

  return {
    weekStart,
    weekEnd,
    days: dayWindows,
    timeRows,
  };
}

export async function resolveDoctorIdForUser(userId: string): Promise<string | null> {
  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    select: { id: true },
  });
  return doctor?.id ?? null;
}
