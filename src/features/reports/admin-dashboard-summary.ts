import "server-only";

import type { AppointmentStatus, PaymentStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

import type { DashboardRange } from "./dashboard-range";

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "PENDING_PAYMENT",
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "EXPIRED",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "CREATED",
  "ORDER_CREATED",
  "PENDING",
  "PAID",
  "FAILED",
  "EXPIRED",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
];

export type StatusCount<T extends string> = {
  status: T;
  count: number;
};

export type AdminDashboardSummary = {
  totalDoctors: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  paidPaymentCount: number;
  paidAmountPaise: number;
  failedPaymentCount: number;
  appointmentsByStatus: StatusCount<AppointmentStatus>[];
  paymentsByStatus: StatusCount<PaymentStatus>[];
};

function countFor<T extends string>(
  rows: Array<{ status: T; _count: { _all: number } }>,
  status: T,
): number {
  return rows.find((row) => row.status === status)?._count._all ?? 0;
}

export async function getAdminDashboardSummary(
  range: DashboardRange,
): Promise<AdminDashboardSummary> {
  const createdInRange = { gte: range.fromUtc, lt: range.toUtcExclusive };

  const [totalDoctors, appointmentGroups, paymentGroups] = await Promise.all([
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.appointment.groupBy({
      by: ["status"],
      where: { startsAt: createdInRange },
      _count: { _all: true },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      where: { createdAt: createdInRange },
      _count: { _all: true },
      _sum: { amountPaise: true },
    }),
  ]);

  const appointmentsByStatus = APPOINTMENT_STATUSES.map((status) => ({
    status,
    count: countFor(appointmentGroups, status),
  }));
  const paymentsByStatus = PAYMENT_STATUSES.map((status) => ({
    status,
    count: countFor(paymentGroups, status),
  }));
  const paidRow = paymentGroups.find((row) => row.status === "PAID");

  return {
    totalDoctors,
    totalAppointments: appointmentsByStatus.reduce((sum, row) => sum + row.count, 0),
    pendingAppointments:
      countFor(appointmentGroups, "PENDING_PAYMENT") +
      countFor(appointmentGroups, "PENDING"),
    confirmedAppointments: countFor(appointmentGroups, "ACCEPTED"),
    completedAppointments: countFor(appointmentGroups, "COMPLETED"),
    paidPaymentCount: paidRow?._count._all ?? 0,
    paidAmountPaise: paidRow?._sum.amountPaise ?? 0,
    failedPaymentCount: countFor(paymentGroups, "FAILED"),
    appointmentsByStatus,
    paymentsByStatus,
  };
}
