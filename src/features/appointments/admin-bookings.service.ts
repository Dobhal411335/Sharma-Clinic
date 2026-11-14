import "server-only";

import type { AppointmentStatus, PaymentStatus, Prisma } from "@prisma/client";

import {
  notifyAppointmentAccepted,
  notifyAppointmentDeclined,
} from "@/features/appointments/booking-notifications";
import { prisma } from "@/lib/db/prisma";
import { logAuditEvent } from "@/lib/logger";
import type {
  BookingAppointmentStatus,
  BookingOrderDetail,
  BookingOrderListItem,
  BookingOrderListResult,
  BookingOrderSummary,
  BookingPaymentStatus,
  BookingStatusUpdate,
} from "@/types/admin/booking-order";

function clinicDayBounds(isoDate: string): { start: Date; end: Date } {
  // Asia/Kolkata = UTC+05:30
  const start = new Date(`${isoDate}T00:00:00+05:30`);
  const end = new Date(`${isoDate}T23:59:59.999+05:30`);
  return { start, end };
}

function latestPaymentStatus(
  payments: Array<{ status: PaymentStatus; paidAt: Date | null; createdAt: Date }>,
): BookingPaymentStatus {
  if (payments.length === 0) return "NONE";
  const paid = payments.find((p) => p.status === "PAID");
  if (paid) return "PAID";
  const sorted = [...payments].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  return sorted[0]!.status as BookingPaymentStatus;
}

function toListItem(
  row: {
    id: string;
    bookingReference: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string | null;
    doctorId: string;
    startsAt: Date;
    endsAt: Date;
    feeSnapshotPaise: number;
    currency: string;
    status: AppointmentStatus;
    reason: string | null;
    createdAt: Date;
    doctor: { displayName: string };
    payments: Array<{
      status: PaymentStatus;
      paidAt: Date | null;
      createdAt: Date;
    }>;
  },
): BookingOrderListItem {
  return {
    id: row.id,
    bookingReference: row.bookingReference,
    patientName: row.patientName,
    patientEmail: row.patientEmail,
    patientPhone: row.patientPhone,
    doctorId: row.doctorId,
    doctorName: row.doctor.displayName,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    feeSnapshotPaise: row.feeSnapshotPaise,
    currency: row.currency,
    appointmentStatus: row.status as BookingAppointmentStatus,
    paymentStatus: latestPaymentStatus(row.payments),
    reason: row.reason,
    createdAt: row.createdAt.toISOString(),
  };
}

async function buildSummary(input: {
  date?: string;
  doctorId?: string;
}): Promise<BookingOrderSummary> {
  // Match list scope (date + doctor). Ignore status filter so cards stay an overview.
  const baseWhere: Prisma.AppointmentWhereInput = {};
  if (input.date) {
    const { start, end } = clinicDayBounds(input.date);
    baseWhere.startsAt = { gte: start, lte: end };
  }
  if (input.doctorId?.trim()) {
    baseWhere.doctorId = input.doctorId.trim();
  }

  const [todayCount, paidCount, pendingAcceptanceCount, declinedCount, pendingPaymentCount] =
    await Promise.all([
      prisma.appointment.count({ where: baseWhere }),
      prisma.appointment.count({
        where: {
          ...baseWhere,
          payments: { some: { status: "PAID" } },
        },
      }),
      prisma.appointment.count({
        where: { ...baseWhere, status: "PENDING" },
      }),
      prisma.appointment.count({
        where: { ...baseWhere, status: "DECLINED" },
      }),
      prisma.appointment.count({
        where: { ...baseWhere, status: "PENDING_PAYMENT" },
      }),
    ]);

  return {
    todayCount,
    paidCount,
    pendingAcceptanceCount,
    declinedCount,
    pendingPaymentCount,
  };
}

export type ListAdminBookingsInput = {
  status?: AppointmentStatus | "ALL";
  doctorId?: string;
  /** YYYY-MM-DD clinic local; defaults to today */
  date?: string;
};

function assertStatusTransition(
  from: AppointmentStatus,
  to: BookingStatusUpdate,
): void {
  if (from === "PENDING_PAYMENT") {
    if (to !== "DECLINED") {
      throw new Error("Cannot accept an unpaid booking.");
    }
    return;
  }

  if (from === "PENDING") {
    if (to !== "PENDING" && to !== "ACCEPTED" && to !== "DECLINED") {
      throw new Error(
        `Cannot change status from PENDING to ${to}. Accept or decline first.`,
      );
    }
    return;
  }

  if (from === "ACCEPTED") {
    if (
      to !== "ACCEPTED" &&
      to !== "COMPLETED" &&
      to !== "NO_SHOW" &&
      to !== "DECLINED"
    ) {
      throw new Error(
        `Cannot change status from ACCEPTED to ${to}. Use completed, no show, or declined.`,
      );
    }
    return;
  }

  if (from === "DECLINED") {
    if (to !== "DECLINED" && to !== "PENDING" && to !== "ACCEPTED") {
      throw new Error(
        `Cannot change status from DECLINED to ${to}. Only reviewable statuses are allowed.`,
      );
    }
    return;
  }

  throw new Error(
    `Cannot change status from ${from}. Only reviewable bookings can be updated.`,
  );
}

export async function listAdminBookings(
  input: ListAdminBookingsInput = {},
): Promise<BookingOrderListResult> {
  const dateRaw = input.date?.trim() ?? "";
  const date = dateRaw ? dateRaw.slice(0, 10) : "";
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("date must be YYYY-MM-DD.");
  }

  const where: Prisma.AppointmentWhereInput = {};
  if (date) {
    const { start, end } = clinicDayBounds(date);
    where.startsAt = { gte: start, lte: end };
  }

  if (input.status && input.status !== "ALL") {
    where.status = input.status;
  }
  if (input.doctorId?.trim()) {
    where.doctorId = input.doctorId.trim();
  }

  const doctorId = input.doctorId?.trim() || undefined;

  const [rows, summary, doctors] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        doctor: { select: { displayName: true } },
        payments: {
          select: { status: true, paidAt: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      ...(date ? {} : { take: 200 }),
    }),
    buildSummary({ date: date || undefined, doctorId }),
    doctorId
      ? prisma.doctor.findMany({
          where: { id: doctorId },
          select: { id: true, displayName: true },
        })
      : prisma.doctor.findMany({
          where: { isActive: true },
          select: { id: true, displayName: true },
          orderBy: { displayName: "asc" },
        }),
  ]);

  return {
    summary,
    items: rows.map(toListItem),
    doctors: doctors.map((d) => ({ id: d.id, name: d.displayName })),
  };
}

export async function getAdminBooking(
  id: string,
  options?: { doctorId?: string },
): Promise<BookingOrderDetail> {
  const row = await prisma.appointment.findUnique({
    where: { id },
    include: {
      doctor: { select: { displayName: true } },
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!row) throw new Error("Booking not found.");
  if (options?.doctorId && row.doctorId !== options.doctorId) {
    throw new Error("Booking not found.");
  }

  const latestPaid =
    row.payments.find((p) => p.status === "PAID") ?? row.payments[0] ?? null;

  return {
    ...toListItem(row),
    accessToken: row.accessToken,
    cancellationReason: row.cancellationReason,
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    medicalHistoryImageUrl: row.medicalHistoryImageUrl,
    medicalHistoryImagePublicId: row.medicalHistoryImagePublicId,
    payment: latestPaid
      ? {
          id: latestPaid.id,
          status: latestPaid.status as BookingPaymentStatus,
          amountPaise: latestPaid.amountPaise,
          providerOrderId: latestPaid.providerOrderId,
          providerPaymentId: latestPaid.providerPaymentId,
          paidAt: latestPaid.paidAt?.toISOString() ?? null,
        }
      : null,
  };
}

export async function updateAdminBookingStatus(input: {
  id: string;
  status: BookingStatusUpdate;
  reason?: string;
  actorUserId: string;
  doctorId?: string;
}): Promise<BookingOrderDetail> {
  const existing = await prisma.appointment.findUnique({
    where: { id: input.id },
    select: { id: true, status: true, doctorId: true },
  });
  if (!existing) throw new Error("Booking not found.");
  if (input.doctorId && existing.doctorId !== input.doctorId) {
    throw new Error("Booking not found.");
  }

  assertStatusTransition(existing.status, input.status);

  // Unpaid holds cannot be accepted; staff may decline them as DECLINED.
  if (existing.status === "PENDING_PAYMENT" && input.status === "ACCEPTED") {
    throw new Error("Cannot accept an unpaid booking.");
  }

  const reason = input.reason?.trim() || null;
  const data: Prisma.AppointmentUpdateInput = {
    status: input.status,
  };

  if (input.status === "ACCEPTED") {
    data.confirmedAt = new Date();
    data.cancellationReason = null;
    data.cancelledAt = null;
    data.completedAt = null;
  } else if (input.status === "DECLINED") {
    data.cancelledAt = new Date();
    data.cancellationReason =
      reason || "The clinic was unable to accept this appointment request.";
    data.completedAt = null;
  } else if (input.status === "PENDING") {
    data.confirmedAt = null;
    data.cancelledAt = null;
    data.cancellationReason = null;
    data.completedAt = null;
  } else if (input.status === "COMPLETED") {
    data.completedAt = new Date();
    data.cancellationReason = null;
    data.cancelledAt = null;
  } else if (input.status === "NO_SHOW") {
    data.completedAt = null;
    data.cancelledAt = new Date();
    data.cancellationReason = reason || "Patient did not attend the appointment.";
  }

  await prisma.appointment.update({
    where: { id: input.id },
    data,
  });

  void logAuditEvent({
    action: "booking.status_updated",
    entityType: "Appointment",
    entityId: input.id,
    actorUserId: input.actorUserId,
    metadata: {
      from: existing.status,
      to: input.status,
      hasReason: Boolean(reason),
      scopedDoctorId: input.doctorId ?? null,
    },
  });

  if (input.status === "ACCEPTED") {
    void notifyAppointmentAccepted(input.id).catch(() => undefined);
  } else if (input.status === "DECLINED") {
    void notifyAppointmentDeclined(input.id, reason ?? undefined).catch(
      () => undefined,
    );
  }

  return getAdminBooking(input.id, { doctorId: input.doctorId });
}

export async function listDoctorBookings(
  doctorId: string,
  input: Omit<ListAdminBookingsInput, "doctorId"> = {},
): Promise<BookingOrderListResult> {
  return listAdminBookings({ ...input, doctorId });
}

export async function getDoctorBooking(
  doctorId: string,
  id: string,
): Promise<BookingOrderDetail> {
  return getAdminBooking(id, { doctorId });
}

export async function updateDoctorBookingStatus(input: {
  doctorId: string;
  id: string;
  status: BookingStatusUpdate;
  reason?: string;
  actorUserId: string;
}): Promise<BookingOrderDetail> {
  return updateAdminBookingStatus({
    id: input.id,
    status: input.status,
    reason: input.reason,
    actorUserId: input.actorUserId,
    doctorId: input.doctorId,
  });
}
