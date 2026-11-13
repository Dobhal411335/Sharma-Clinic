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

const REVIEW_STATUSES: AppointmentStatus[] = ["PENDING", "ACCEPTED", "DECLINED"];

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
    prisma.doctor.findMany({
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

export async function getAdminBooking(id: string): Promise<BookingOrderDetail> {
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
}): Promise<BookingOrderDetail> {
  const existing = await prisma.appointment.findUnique({
    where: { id: input.id },
    select: { id: true, status: true },
  });
  if (!existing) throw new Error("Booking not found.");

  if (!REVIEW_STATUSES.includes(existing.status) && existing.status !== "PENDING_PAYMENT") {
    throw new Error(
      `Cannot change status from ${existing.status}. Only reviewable bookings can be updated.`,
    );
  }

  // Unpaid holds cannot be accepted; admin may decline/cancel them as DECLINED.
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
  } else if (input.status === "DECLINED") {
    data.cancelledAt = new Date();
    data.cancellationReason =
      reason || "The clinic was unable to accept this appointment request.";
  } else if (input.status === "PENDING") {
    data.confirmedAt = null;
    data.cancelledAt = null;
    data.cancellationReason = null;
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
    },
  });

  if (input.status === "ACCEPTED") {
    void notifyAppointmentAccepted(input.id).catch(() => undefined);
  } else if (input.status === "DECLINED") {
    void notifyAppointmentDeclined(input.id, reason ?? undefined).catch(
      () => undefined,
    );
  }

  return getAdminBooking(input.id);
}
