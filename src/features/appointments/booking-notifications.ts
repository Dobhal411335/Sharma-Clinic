import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  sendAppointmentCancelledEmail,
  sendAppointmentConfirmedEmail,
  sendBookingReceivedEmail,
  sendNewAppointmentDoctorEmail,
  sendNewBookingAdminEmail,
} from "@/server/integrations/brevo";
import { getClinicConfig } from "@/server/integrations/brevo/config";

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

export async function notifyFreeBookingReceived(appointmentId: string): Promise<void> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: { include: { user: true } } },
  });
  if (!appointment || appointment.status !== "PENDING") return;

  const clinic = await getClinicConfig();
  const startsAtLabel = formatSlotLabel(
    appointment.startsAt,
    clinic.clinicTimezone,
  );
  const doctorName = appointment.doctor.displayName;
  const adminEmail =
    clinic.adminNotificationEmail || clinic.clinicEmail || undefined;

  await sendBookingReceivedEmail(
    {
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      doctorName,
      bookingReference: appointment.bookingReference,
      appointment: { startsAtLabel, timezoneLabel: clinic.clinicTimezone },
      bookingStatus: "Pending clinic acceptance",
      paymentStatus: "Not required",
      nextSteps:
        "No payment was required. The clinic will review and confirm your appointment shortly.",
    },
    { idempotencyKey: `booking-received-free:${appointment.id}` },
  );

  await sendNewAppointmentDoctorEmail(
    {
      doctorName,
      doctorEmail: appointment.doctor.user.email,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      patientPhone: appointment.patientPhone ?? undefined,
      bookingReference: appointment.bookingReference,
      appointment: { startsAtLabel, timezoneLabel: clinic.clinicTimezone },
      bookingStatus: "Pending acceptance",
    },
    { idempotencyKey: `doctor-new-appt-free:${appointment.id}` },
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
        appointment: { startsAtLabel, timezoneLabel: clinic.clinicTimezone },
        bookingStatus: "Pending acceptance",
        paymentStatus: "Not required",
      },
      { idempotencyKey: `admin-new-booking-free:${appointment.id}` },
    );
  }
}

export async function notifyAppointmentAccepted(appointmentId: string): Promise<void> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true },
  });
  if (!appointment || appointment.status !== "ACCEPTED") return;
  const clinic = await getClinicConfig();
  const startsAtLabel = formatSlotLabel(
    appointment.startsAt,
    clinic.clinicTimezone,
  );

  await sendAppointmentConfirmedEmail(
    {
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      doctorName: appointment.doctor.displayName,
      bookingReference: appointment.bookingReference,
      appointment: { startsAtLabel, timezoneLabel: clinic.clinicTimezone },
      locationLabel: clinic.clinicAddress || undefined,
      paymentInfo:
        appointment.feeSnapshotPaise > 0
          ? `Paid / fee ₹${(appointment.feeSnapshotPaise / 100).toFixed(0)}`
          : "No payment required",
    },
    { idempotencyKey: `appointment-accepted:${appointment.id}` },
  );
}

export async function notifyAppointmentDeclined(
  appointmentId: string,
  reason?: string,
): Promise<void> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true },
  });
  if (!appointment || appointment.status !== "DECLINED") return;
  const clinic = await getClinicConfig();
  const startsAtLabel = formatSlotLabel(
    appointment.startsAt,
    clinic.clinicTimezone,
  );

  await sendAppointmentCancelledEmail(
    {
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      doctorName: appointment.doctor.displayName,
      bookingReference: appointment.bookingReference,
      appointment: { startsAtLabel, timezoneLabel: clinic.clinicTimezone },
      cancellationReason:
        reason?.trim() ||
        "The clinic was unable to accept this appointment request.",
    },
    { idempotencyKey: `appointment-declined:${appointment.id}` },
  );
}
