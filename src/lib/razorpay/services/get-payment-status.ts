import { db } from "@/lib/db/prisma";

import {
  RazorpayIntegrationError,
  type PaymentStatusResult,
} from "../types";

/**
 * Limited, non-sensitive payment status for the public booking flow.
 * Does not return patient PII, doctor internals, or provider secrets.
 */
export async function getPaymentStatusForAppointment(
  appointmentId: string,
  options?: {
    /** When provided, must match the appointment access token. */
    accessToken?: string;
    /** Doctor-scoped sessions may only read their own appointments. */
    doctorId?: string;
  },
): Promise<PaymentStatusResult> {
  const trimmed = appointmentId?.trim();
  if (!trimmed) {
    throw new RazorpayIntegrationError(
      "appointmentId is required.",
      "APPOINTMENT_ID_REQUIRED",
    );
  }

  const appointment = await db.appointment.findUnique({
    where: { id: trimmed },
    include: {
      payments: {
        orderBy: { attemptNumber: "desc" },
        take: 5,
      },
    },
  });

  if (!appointment) {
    throw new RazorpayIntegrationError(
      "Appointment not found.",
      "APPOINTMENT_NOT_FOUND",
      404,
    );
  }

  if (options?.accessToken && options.accessToken !== appointment.accessToken) {
    throw new RazorpayIntegrationError(
      "Appointment access denied.",
      "APPOINTMENT_ACCESS_DENIED",
      403,
    );
  }

  if (options?.doctorId && options.doctorId !== appointment.doctorId) {
    throw new RazorpayIntegrationError(
      "Doctor cannot access another doctor's appointment payment.",
      "DOCTOR_SCOPE_DENIED",
      403,
    );
  }

  const paid = appointment.payments.find((p) => p.status === "PAID");
  const latest = appointment.payments[0] ?? null;
  const selected = paid ?? latest;

  return {
    appointmentId: appointment.id,
    appointmentStatus: appointment.status,
    paymentStatus: selected?.status ?? null,
    paymentId: selected?.id ?? null,
    amountPaise: selected?.amountPaise ?? appointment.feeSnapshotPaise,
    currency: selected?.currency ?? appointment.currency,
    paidAt: selected?.paidAt?.toISOString() ?? null,
    needsReconciliation: selected?.needsReconciliation ?? false,
  };
}
