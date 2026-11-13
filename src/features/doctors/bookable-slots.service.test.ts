import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  doctorFindFirst,
  weeklyFindMany,
  exceptionFindMany,
  appointmentFindMany,
} = vi.hoisted(() => ({
  doctorFindFirst: vi.fn(),
  weeklyFindMany: vi.fn(),
  exceptionFindMany: vi.fn(),
  appointmentFindMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    doctor: { findFirst: doctorFindFirst },
    weeklyAvailability: { findMany: weeklyFindMany },
    availabilityException: { findMany: exceptionFindMany },
    appointment: { findMany: appointmentFindMany },
  },
}));

import {
  assertSlotIsBookable,
  listBookableSlots,
} from "./bookable-slots.service";

describe("listBookableSlots / assertSlotIsBookable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    doctorFindFirst.mockResolvedValue({ id: "doc_1" });
    exceptionFindMany.mockResolvedValue([]);
    appointmentFindMany.mockResolvedValue([]);
    weeklyFindMany.mockResolvedValue([
      {
        id: "win_1",
        weekday: "MONDAY",
        startTimeLocal: "09:00",
        endTimeLocal: "09:30",
        slotDurationMinutes: 10,
        scope: "FIXED",
        isActive: true,
        effectiveFrom: null,
        effectiveUntil: null,
      },
    ]);
  });

  it("expands a weekly window into free slots", async () => {
    const slots = await listBookableSlots({
      doctorId: "doc_1",
      date: "2030-01-07",
    });
    expect(slots.map((s) => s.label)).toEqual([
      "09:00 – 09:10",
      "09:10 – 09:20",
      "09:20 – 09:30",
    ]);
  });

  it("excludes slots overlapping PENDING/ACCEPTED holds", async () => {
    appointmentFindMany.mockResolvedValue([
      {
        startsAt: new Date("2030-01-07T03:40:00.000Z"),
        endsAt: new Date("2030-01-07T03:50:00.000Z"),
      },
    ]);

    const slots = await listBookableSlots({
      doctorId: "doc_1",
      date: "2030-01-07",
    });
    expect(slots.map((s) => s.label)).toEqual([
      "09:00 – 09:10",
      "09:20 – 09:30",
    ]);
  });

  it("returns no slots on a full-day UNAVAILABLE exception", async () => {
    exceptionFindMany.mockResolvedValue([
      { type: "UNAVAILABLE", startTimeLocal: null, endTimeLocal: null },
    ]);
    const slots = await listBookableSlots({
      doctorId: "doc_1",
      date: "2030-01-07",
    });
    expect(slots).toEqual([]);
  });

  it("assertSlotIsBookable rejects a conflicting slot", async () => {
    appointmentFindMany.mockResolvedValue([
      {
        startsAt: new Date("2030-01-07T03:30:00.000Z"),
        endsAt: new Date("2030-01-07T03:40:00.000Z"),
      },
    ]);

    await expect(
      assertSlotIsBookable({
        doctorId: "doc_1",
        startsAt: new Date("2030-01-07T03:30:00.000Z"),
        endsAt: new Date("2030-01-07T03:40:00.000Z"),
      }),
    ).rejects.toThrow(/not available/i);
  });
});
