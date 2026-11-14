import "server-only";

import type { AppointmentStatus } from "@prisma/client";

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

export type StatusCount = {
  status: AppointmentStatus;
  count: number;
};

export type DoctorDashboardSummary = {
  uniquePatients: number;
  totalAppointments: number;
  pendingAcceptance: number;
  acceptedAppointments: number;
  completedAppointments: number;
  pendingPaymentCount: number;
  paidAmountPaise: number;
  paidPaymentCount: number;
  appointmentsByStatus: StatusCount[];
};

function countFor(
  rows: Array<{ status: AppointmentStatus; _count: { _all: number } }>,
  status: AppointmentStatus,
): number {
  return rows.find((row) => row.status === status)?._count._all ?? 0;
}

export async function getDoctorDashboardSummary(
  doctorId: string,
  range: DashboardRange,
): Promise<DoctorDashboardSummary> {
  const startsInRange = { gte: range.fromUtc, lt: range.toUtcExclusive };
  const doctorScope = { doctorId };

  const [appointmentGroups, uniquePatients, paidAgg] = await Promise.all([
    prisma.appointment.groupBy({
      by: ["status"],
      where: { ...doctorScope, startsAt: startsInRange },
      _count: { _all: true },
    }),
    prisma.appointment.findMany({
      where: { ...doctorScope, startsAt: startsInRange },
      select: { patientId: true },
      distinct: ["patientId"],
    }),
    prisma.payment.aggregate({
      where: {
        status: "PAID",
        createdAt: startsInRange,
        appointment: { doctorId },
      },
      _sum: { amountPaise: true },
      _count: { _all: true },
    }),
  ]);

  const appointmentsByStatus = APPOINTMENT_STATUSES.map((status) => ({
    status,
    count: countFor(appointmentGroups, status),
  }));

  return {
    uniquePatients: uniquePatients.length,
    totalAppointments: appointmentsByStatus.reduce((sum, row) => sum + row.count, 0),
    pendingAcceptance: countFor(appointmentGroups, "PENDING"),
    acceptedAppointments: countFor(appointmentGroups, "ACCEPTED"),
    completedAppointments: countFor(appointmentGroups, "COMPLETED"),
    pendingPaymentCount: countFor(appointmentGroups, "PENDING_PAYMENT"),
    paidAmountPaise: paidAgg._sum.amountPaise ?? 0,
    paidPaymentCount: paidAgg._count._all,
    appointmentsByStatus,
  };
}
