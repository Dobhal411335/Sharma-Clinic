import { beforeEach, describe, expect, it, vi } from "vitest";

const { doctorFindFirst, assertSlot, transaction } = vi.hoisted(() => ({
  doctorFindFirst: vi.fn(),
  assertSlot: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    doctor: { findFirst: doctorFindFirst },
    $transaction: transaction,
  },
}));

vi.mock("@/features/doctors/bookable-slots.service", () => ({
  assertSlotIsBookable: (...args: unknown[]) => assertSlot(...args),
}));

import { createPublicAppointment } from "./public-booking.service";

describe("createPublicAppointment fee auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assertSlot.mockResolvedValue(undefined);
  });

  it("locks feeSnapshotPaise from the doctor record, not the client", async () => {
    doctorFindFirst.mockResolvedValue({
      id: "doc_1",
      displayName: "Dr. Ada",
      consultationFeePaise: 75_000,
    });

    const appointmentCreate = vi.fn().mockResolvedValue({
      id: "appt_1",
      bookingReference: "ref_1",
      accessToken: "tok_1",
      startsAt: new Date("2030-01-07T03:30:00.000Z"),
      endsAt: new Date("2030-01-07T03:40:00.000Z"),
      feeSnapshotPaise: 75_000,
      status: "PENDING_PAYMENT",
    });

    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        patient: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: "pat_1" }),
        },
        appointment: { create: appointmentCreate },
      };
      return fn(tx);
    });

    const result = await createPublicAppointment({
      doctorId: "doc_1",
      patientName: "Pat Patient",
      email: "pat@example.com",
      phone: "9876543210",
      startsAt: "2030-01-07T03:30:00.000Z",
      endsAt: "2030-01-07T03:40:00.000Z",
      problem: "Checkup",
    });

    expect(result.feeSnapshotPaise).toBe(75_000);
    expect(result.requiresPayment).toBe(true);
    expect(result.appointmentStatus).toBe("PENDING_PAYMENT");
    expect(appointmentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          feeSnapshotPaise: 75_000,
          status: "PENDING_PAYMENT",
        }),
      }),
    );
  });

  it("skips payment when consultation fee is zero", async () => {
    doctorFindFirst.mockResolvedValue({
      id: "doc_1",
      displayName: "Dr. Ada",
      consultationFeePaise: 0,
    });

    const appointmentCreate = vi.fn().mockResolvedValue({
      id: "appt_2",
      bookingReference: "ref_2",
      accessToken: "tok_2",
      startsAt: new Date("2030-01-07T03:30:00.000Z"),
      endsAt: new Date("2030-01-07T03:40:00.000Z"),
      feeSnapshotPaise: 0,
      status: "PENDING",
    });

    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        patient: {
          findFirst: vi.fn().mockResolvedValue({
            id: "pat_1",
            fullName: "Pat Patient",
          }),
          create: vi.fn(),
          update: vi.fn(),
        },
        appointment: { create: appointmentCreate },
      };
      return fn(tx);
    });

    const result = await createPublicAppointment({
      doctorId: "doc_1",
      patientName: "Pat Patient",
      email: "pat@example.com",
      phone: "9876543210",
      startsAt: "2030-01-07T03:30:00.000Z",
      endsAt: "2030-01-07T03:40:00.000Z",
    });

    expect(result.requiresPayment).toBe(false);
    expect(result.appointmentStatus).toBe("PENDING");
    expect(result.feeSnapshotPaise).toBe(0);
    expect(appointmentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          feeSnapshotPaise: 0,
          status: "PENDING",
        }),
      }),
    );
  });
});
