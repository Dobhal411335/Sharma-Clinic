import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  appointmentFindUnique,
  appointmentUpdate,
  appointmentFindMany,
  appointmentCount,
  doctorFindMany,
  notifyAccepted,
  notifyDeclined,
} = vi.hoisted(() => ({
  appointmentFindUnique: vi.fn(),
  appointmentUpdate: vi.fn(),
  appointmentFindMany: vi.fn(),
  appointmentCount: vi.fn(),
  doctorFindMany: vi.fn(),
  notifyAccepted: vi.fn(),
  notifyDeclined: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    appointment: {
      findUnique: appointmentFindUnique,
      update: appointmentUpdate,
      findMany: appointmentFindMany,
      count: appointmentCount,
    },
    doctor: {
      findMany: doctorFindMany,
    },
  },
}));

vi.mock("@/features/appointments/booking-notifications", () => ({
  notifyAppointmentAccepted: (...args: unknown[]) => notifyAccepted(...args),
  notifyAppointmentDeclined: (...args: unknown[]) => notifyDeclined(...args),
}));

vi.mock("@/lib/logger", () => ({
  logAuditEvent: vi.fn(),
}));

import { updateAdminBookingStatus } from "./admin-bookings.service";

function baseAppointment(overrides: Record<string, unknown> = {}) {
  return {
    id: "appt_1",
    bookingReference: "ref_1",
    accessToken: "tok_1",
    patientName: "Pat",
    patientEmail: "pat@example.com",
    patientPhone: "9876543210",
    doctorId: "doc_1",
    startsAt: new Date("2026-11-10T04:30:00.000Z"),
    endsAt: new Date("2026-11-10T04:40:00.000Z"),
    feeSnapshotPaise: 50_000,
    currency: "INR",
    status: "PENDING",
    reason: null,
    cancellationReason: null,
    confirmedAt: null,
    cancelledAt: null,
    completedAt: null,
    medicalHistoryImageUrl: null,
    medicalHistoryImagePublicId: null,
    createdAt: new Date("2026-11-09T10:00:00.000Z"),
    updatedAt: new Date("2026-11-09T10:00:00.000Z"),
    doctor: { displayName: "Dr. Ada" },
    payments: [
      {
        id: "pay_1",
        status: "PAID",
        amountPaise: 50_000,
        providerOrderId: "order_1",
        providerPaymentId: "pay_rzp_1",
        paidAt: new Date("2026-11-09T10:05:00.000Z"),
        createdAt: new Date("2026-11-09T10:01:00.000Z"),
      },
    ],
    ...overrides,
  };
}

describe("updateAdminBookingStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appointmentUpdate.mockResolvedValue({});
    notifyAccepted.mockResolvedValue(undefined);
    notifyDeclined.mockResolvedValue(undefined);
  });

  it("accepts a pending booking and notifies the patient", async () => {
    appointmentFindUnique
      .mockResolvedValueOnce({ id: "appt_1", status: "PENDING" })
      .mockResolvedValueOnce(baseAppointment({ status: "ACCEPTED" }));

    const result = await updateAdminBookingStatus({
      id: "appt_1",
      status: "ACCEPTED",
      actorUserId: "admin_1",
    });

    expect(appointmentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "appt_1" },
        data: expect.objectContaining({
          status: "ACCEPTED",
          confirmedAt: expect.any(Date),
        }),
      }),
    );
    expect(notifyAccepted).toHaveBeenCalledWith("appt_1");
    expect(notifyDeclined).not.toHaveBeenCalled();
    expect(result.appointmentStatus).toBe("ACCEPTED");
  });

  it("declines a pending booking with a reason email", async () => {
    appointmentFindUnique
      .mockResolvedValueOnce({ id: "appt_1", status: "PENDING" })
      .mockResolvedValueOnce(
        baseAppointment({
          status: "DECLINED",
          cancellationReason: "Doctor unavailable",
        }),
      );

    const result = await updateAdminBookingStatus({
      id: "appt_1",
      status: "DECLINED",
      reason: "Doctor unavailable",
      actorUserId: "admin_1",
    });

    expect(appointmentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "DECLINED",
          cancellationReason: "Doctor unavailable",
          cancelledAt: expect.any(Date),
        }),
      }),
    );
    expect(notifyDeclined).toHaveBeenCalledWith("appt_1", "Doctor unavailable");
    expect(result.appointmentStatus).toBe("DECLINED");
  });

  it("rejects accepting an unpaid PENDING_PAYMENT booking", async () => {
    appointmentFindUnique.mockResolvedValueOnce({
      id: "appt_1",
      status: "PENDING_PAYMENT",
    });

    await expect(
      updateAdminBookingStatus({
        id: "appt_1",
        status: "ACCEPTED",
        actorUserId: "admin_1",
      }),
    ).rejects.toThrow(/unpaid/i);

    expect(appointmentUpdate).not.toHaveBeenCalled();
    expect(notifyAccepted).not.toHaveBeenCalled();
  });

  it("rejects transitions from terminal completed status", async () => {
    appointmentFindUnique.mockResolvedValueOnce({
      id: "appt_1",
      status: "COMPLETED",
    });

    await expect(
      updateAdminBookingStatus({
        id: "appt_1",
        status: "ACCEPTED",
        actorUserId: "admin_1",
      }),
    ).rejects.toThrow(/Cannot change status/i);
  });
});
