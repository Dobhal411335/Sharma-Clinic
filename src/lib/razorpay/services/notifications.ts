import {
  sendBookingReceivedEmail,
  sendNewAppointmentDoctorEmail,
  sendNewBookingAdminEmail,
  sendPaymentReceiptEmail,
  sendPaymentReceivedAdminEmail,
} from "@/server/integrations/brevo";
import { getClinicConfig } from "@/server/integrations/brevo/config";
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
 * Appointment is PENDING (awaiting admin) — do not send accepted/confirmed here.
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
      idempotencyKey: `booking-received:${input.appointmentId}:${input.paymentId}`,
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

    const clinic = await getClinicConfig();
    const appointment = payment.appointment;
    const doctorName = appointment.doctor.displayName;
    const doctorEmail = appointment.doctor.user.email;
    const startsAtLabel = formatSlotLabel(
      appointment.startsAt,
      clinic.clinicTimezone,
    );
    const paidAtLabel = formatPaidAtLabel(payment.paidAt, clinic.clinicTimezone);
    const adminEmail =
      clinic.adminNotificationEmail || clinic.clinicEmail || undefined;

    for (const item of outbox) {
      try {
        if (item.kind === "payment-receipt") {
          await sendPaymentReceiptEmail(
            {
              patientName: appointment.patientName,
              patientEmail: appointment.patientEmail,
              doctorName,
              bookingReference: appointment.bookingReference,
              paymentReference:
                payment.providerPaymentId ?? payment.id,
              amount: {
                amountPaise: payment.amountPaise,
                currency: "INR",
              },
              paidAtLabel,
              paymentStatus: "Paid",
              appointment: {
                startsAtLabel,
                timezoneLabel: clinic.clinicTimezone,
              },
            },
            { idempotencyKey: item.idempotencyKey },
          );
        } else if (item.kind === "appointment-confirmed") {
          // Paid but awaiting admin — booking-received, not accepted.
          await sendBookingReceivedEmail(
            {
              patientName: appointment.patientName,
              patientEmail: appointment.patientEmail,
              doctorName,
              bookingReference: appointment.bookingReference,
              appointment: {
                startsAtLabel,
                timezoneLabel: clinic.clinicTimezone,
              },
              bookingStatus: "Pending clinic acceptance",
              paymentStatus: "Paid",
              nextSteps:
                "Your payment was received. The clinic will review and confirm your appointment shortly.",
            },
            { idempotencyKey: item.idempotencyKey },
          );

          await sendNewAppointmentDoctorEmail(
            {
              doctorName,
              doctorEmail,
              patientName: appointment.patientName,
              patientEmail: appointment.patientEmail,
              patientPhone: appointment.patientPhone ?? undefined,
              bookingReference: appointment.bookingReference,
              appointment: {
                startsAtLabel,
                timezoneLabel: clinic.clinicTimezone,
              },
              bookingStatus: "Pending acceptance",
            },
            {
              idempotencyKey: `doctor-new-appt:${appointment.id}:${payment.id}`,
            },
          );

          if (adminEmail) {
            await sendNewBookingAdminEmail(
              {
                adminEmail,
                patientName: appointment.patientName,
                patientEmail: appointment.patientEmail,
                patientPhone: appointment.patientPhone ?? undefined,
                doctorName,
                bookingReference: appointment.bookingReference,
                appointment: {
                  startsAtLabel,
                  timezoneLabel: clinic.clinicTimezone,
                },
                bookingStatus: "Pending acceptance",
                paymentStatus: "Paid",
              },
              {
                idempotencyKey: `admin-new-booking:${appointment.id}:${payment.id}`,
              },
            );
          }
        } else if (item.kind === "admin-payment-received" && adminEmail) {
          await sendPaymentReceivedAdminEmail(
            {
              adminEmail,
              patientName: appointment.patientName,
              doctorName,
              bookingReference: appointment.bookingReference,
              paymentReference:
                payment.providerPaymentId ?? payment.id,
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
