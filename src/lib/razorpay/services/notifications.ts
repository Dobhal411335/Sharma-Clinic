import {
  sendAppointmentConfirmedEmail,
  sendPaymentReceiptEmail,
  sendPaymentReceivedAdminEmail,
} from "@/lib/brevo";
import { getClinicConfig } from "@/lib/brevo/config";
import { db } from "@/lib/db/prisma";

import type { PaymentNotificationOutboxItem } from "../types";

function formatSlotLabel(startsAt: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone,
    }).format(startsAt);
  } catch {
    return startsAt.toISOString();
  }
}

function formatPaidAtLabel(paidAt: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone,
    }).format(paidAt);
  } catch {
    return paidAt.toISOString();
  }
}

/**
 * Sends post-payment emails AFTER the payment transaction commits.
 * Failures are logged safely and never roll back payment state.
 *
 * Outbox type is prepared for a future durable table — items are built in memory only.
 */
export async function notifyPaymentSucceeded(input: {
  paymentId: string;
  appointmentId: string;
}): Promise<void> {
  const outbox: PaymentNotificationOutboxItem[] = [
    {
      kind: "payment-receipt",
      appointmentId: input.appointmentId,
      paymentId: input.paymentId,
      idempotencyKey: `payment-receipt:${input.paymentId}`,
      createdAt: new Date(),
    },
    {
      kind: "appointment-confirmed",
      appointmentId: input.appointmentId,
      paymentId: input.paymentId,
      idempotencyKey: `appointment-confirmed:${input.appointmentId}:${input.paymentId}`,
      createdAt: new Date(),
    },
    {
      kind: "admin-payment-received",
      appointmentId: input.appointmentId,
      paymentId: input.paymentId,
      idempotencyKey: `admin-payment-received:${input.paymentId}`,
      createdAt: new Date(),
    },
  ];

  try {
    const payment = await db.payment.findUnique({
      where: { id: input.paymentId },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!payment || payment.status !== "PAID" || !payment.paidAt) {
      return;
    }

    const clinic = getClinicConfig();
    const appointment = payment.appointment;
    const doctorName = appointment.doctor.displayName;
    const startsAtLabel = formatSlotLabel(appointment.startsAt, clinic.clinicTimezone);
    const paidAtLabel = formatPaidAtLabel(payment.paidAt, clinic.clinicTimezone);

    for (const item of outbox) {
      try {
        if (item.kind === "payment-receipt") {
          await sendPaymentReceiptEmail(
            {
              patientName: appointment.patientName,
              patientEmail: appointment.patientEmail,
              doctorName,
              bookingReference: appointment.bookingReference,
              paymentReference: payment.id,
              amount: {
                amountPaise: payment.amountPaise,
                currency: "INR",
              },
              paidAtLabel,
              appointment: {
                startsAtLabel,
                timezoneLabel: clinic.clinicTimezone,
              },
            },
            { idempotencyKey: item.idempotencyKey },
          );
        } else if (item.kind === "appointment-confirmed") {
          await sendAppointmentConfirmedEmail(
            {
              patientName: appointment.patientName,
              patientEmail: appointment.patientEmail,
              doctorName,
              bookingReference: appointment.bookingReference,
              appointment: {
                startsAtLabel,
                timezoneLabel: clinic.clinicTimezone,
              },
              locationLabel: clinic.clinicAddress || undefined,
            },
            { idempotencyKey: item.idempotencyKey },
          );
        } else if (item.kind === "admin-payment-received" && clinic.clinicEmail) {
          await sendPaymentReceivedAdminEmail(
            {
              adminEmail: clinic.clinicEmail,
              patientName: appointment.patientName,
              doctorName,
              bookingReference: appointment.bookingReference,
              paymentReference: payment.id,
              amount: {
                amountPaise: payment.amountPaise,
                currency: "INR",
              },
              paidAtLabel,
            },
            { idempotencyKey: item.idempotencyKey },
          );
        }
      } catch (error) {
        console.error("[razorpay] notification item failed", {
          kind: item.kind,
          paymentId: input.paymentId,
          code:
            error instanceof Error ? error.name : "UNKNOWN_NOTIFICATION_ERROR",
        });
      }
    }
  } catch (error) {
    console.error("[razorpay] notifyPaymentSucceeded failed", {
      paymentId: input.paymentId,
      code: error instanceof Error ? error.name : "UNKNOWN_NOTIFICATION_ERROR",
    });
  }
}
