import { sanitizeProviderError } from "../client";
import { getClinicConfig } from "../config";
import { renderNewBookingAdminEmail } from "../templates/admin/new-booking";
import { renderPaymentReceivedAdminEmail } from "../templates/admin/payment-received";
import { renderAppointmentCancelledEmail } from "../templates/appointment/appointment-cancelled";
import { renderAppointmentConfirmedEmail } from "../templates/appointment/appointment-confirmed";
import { renderAppointmentReminderEmail } from "../templates/appointment/appointment-reminder";
import { renderAppointmentRescheduledEmail } from "../templates/appointment/appointment-rescheduled";
import { renderBookingReceivedEmail } from "../templates/appointment/booking-received";
import { renderPaymentReceiptEmail } from "../templates/appointment/payment-receipt";
import { renderDoctorInvitationEmail } from "../templates/auth/doctor-invitation";
import { renderPasswordResetEmail } from "../templates/auth/password-reset";
import { renderAppointmentCancelledDoctorEmail } from "../templates/doctor/appointment-cancelled";
import { renderNewAppointmentDoctorEmail } from "../templates/doctor/new-appointment";
import type {
  AdminNewBookingEmailData,
  AdminPaymentReceivedEmailData,
  AppointmentCancelledEmailData,
  AppointmentConfirmedEmailData,
  AppointmentReminderEmailData,
  AppointmentRescheduledEmailData,
  BookingReceivedEmailData,
  DoctorAppointmentCancelledEmailData,
  DoctorInvitationEmailData,
  DoctorNewAppointmentEmailData,
  EmailSendResult,
  PasswordResetEmailData,
  PaymentReceiptEmailData,
} from "../types";
import {
  assertPositivePaise,
  assertRequiredString,
  assertTrustedUrl,
  assertValidEmail,
} from "../utils/email-validation";
import { sendEmail } from "./send-email";

function appUrl(): string {
  return getClinicConfig().appUrl;
}

function optionalTrustedUrl(
  raw: string | undefined,
  fieldName: string,
): string | undefined {
  if (!raw?.trim()) {
    return undefined;
  }
  return assertTrustedUrl(raw, appUrl(), fieldName);
}

async function runSend(
  work: () => Promise<EmailSendResult>,
): Promise<EmailSendResult> {
  try {
    return await work();
  } catch (error) {
    const sanitized = sanitizeProviderError(error);
    return {
      ok: false,
      code: sanitized.code,
      message: sanitized.message,
    };
  }
}

export async function sendBookingReceivedEmail(
  data: BookingReceivedEmailData,
  options?: { idempotencyKey?: string },
): Promise<EmailSendResult> {
  return runSend(async () => {
    assertValidEmail(data.patientEmail, "patient email");
    assertRequiredString(data.patientName, "patientName");
    assertRequiredString(data.doctorName, "doctorName");
    assertRequiredString(data.bookingReference, "bookingReference");
    assertRequiredString(
      data.appointment.startsAtLabel,
      "appointment.startsAtLabel",
    );

    const rendered = renderBookingReceivedEmail(data);
    return sendEmail({
      to: { email: data.patientEmail, name: data.patientName },
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: ["appointment", "booking-received"],
      templateKind: "booking-received",
      idempotencyKey: options?.idempotencyKey,
    });
  });
}

export async function sendAppointmentConfirmedEmail(
  data: AppointmentConfirmedEmailData,
  options?: { idempotencyKey?: string },
): Promise<EmailSendResult> {
  return runSend(async () => {
    assertValidEmail(data.patientEmail, "patient email");
    assertRequiredString(data.patientName, "patientName");
    assertRequiredString(data.doctorName, "doctorName");
    assertRequiredString(data.bookingReference, "bookingReference");
    assertRequiredString(
      data.appointment.startsAtLabel,
      "appointment.startsAtLabel",
    );

    const manageUrl = optionalTrustedUrl(data.manageUrl, "manageUrl");
    const rendered = renderAppointmentConfirmedEmail({ ...data, manageUrl });
    return sendEmail({
      to: { email: data.patientEmail, name: data.patientName },
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: ["appointment", "appointment-confirmed"],
      templateKind: "appointment-confirmed",
      idempotencyKey: options?.idempotencyKey,
    });
  });
}

export async function sendAppointmentCancelledEmail(
  data: AppointmentCancelledEmailData,
  options?: { idempotencyKey?: string },
): Promise<EmailSendResult> {
  return runSend(async () => {
    assertValidEmail(data.patientEmail, "patient email");
    assertRequiredString(data.patientName, "patientName");
    assertRequiredString(data.doctorName, "doctorName");
    assertRequiredString(data.bookingReference, "bookingReference");
    assertRequiredString(
      data.appointment.startsAtLabel,
      "appointment.startsAtLabel",
    );

    const rebookUrl = optionalTrustedUrl(data.rebookUrl, "rebookUrl");
    const rendered = renderAppointmentCancelledEmail({ ...data, rebookUrl });
    return sendEmail({
      to: { email: data.patientEmail, name: data.patientName },
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: ["appointment", "appointment-cancelled"],
      templateKind: "appointment-cancelled",
      idempotencyKey: options?.idempotencyKey,
    });
  });
}

export async function sendAppointmentRescheduledEmail(
  data: AppointmentRescheduledEmailData,
  options?: { idempotencyKey?: string },
): Promise<EmailSendResult> {
  return runSend(async () => {
    assertValidEmail(data.patientEmail, "patient email");
    assertRequiredString(data.patientName, "patientName");
    assertRequiredString(data.doctorName, "doctorName");
    assertRequiredString(data.bookingReference, "bookingReference");
    assertRequiredString(
      data.previousAppointment.startsAtLabel,
      "previousAppointment.startsAtLabel",
    );
    assertRequiredString(
      data.newAppointment.startsAtLabel,
      "newAppointment.startsAtLabel",
    );

    const manageUrl = optionalTrustedUrl(data.manageUrl, "manageUrl");
    const rendered = renderAppointmentRescheduledEmail({ ...data, manageUrl });
    return sendEmail({
      to: { email: data.patientEmail, name: data.patientName },
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: ["appointment", "appointment-rescheduled"],
      templateKind: "appointment-rescheduled",
      idempotencyKey: options?.idempotencyKey,
    });
  });
}

export async function sendAppointmentReminderEmail(
  data: AppointmentReminderEmailData,
  options?: { idempotencyKey?: string },
): Promise<EmailSendResult> {
  return runSend(async () => {
    assertValidEmail(data.patientEmail, "patient email");
    assertRequiredString(data.patientName, "patientName");
    assertRequiredString(data.doctorName, "doctorName");
    assertRequiredString(data.bookingReference, "bookingReference");
    assertRequiredString(
      data.appointment.startsAtLabel,
      "appointment.startsAtLabel",
    );

    const manageUrl = optionalTrustedUrl(data.manageUrl, "manageUrl");
    const rendered = renderAppointmentReminderEmail({ ...data, manageUrl });
    return sendEmail({
      to: { email: data.patientEmail, name: data.patientName },
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: ["appointment", "appointment-reminder"],
      templateKind: "appointment-reminder",
      idempotencyKey: options?.idempotencyKey,
    });
  });
}

export async function sendPaymentReceiptEmail(
  data: PaymentReceiptEmailData,
  options?: { idempotencyKey?: string },
): Promise<EmailSendResult> {
  return runSend(async () => {
    assertValidEmail(data.patientEmail, "patient email");
    assertRequiredString(data.patientName, "patientName");
    assertRequiredString(data.doctorName, "doctorName");
    assertRequiredString(data.bookingReference, "bookingReference");
    assertRequiredString(data.paymentReference, "paymentReference");
    assertRequiredString(data.paidAtLabel, "paidAtLabel");
    assertPositivePaise(data.amount.amountPaise);

    const receiptUrl = optionalTrustedUrl(data.receiptUrl, "receiptUrl");
    const rendered = renderPaymentReceiptEmail({ ...data, receiptUrl });
    return sendEmail({
      to: { email: data.patientEmail, name: data.patientName },
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: ["payment", "payment-receipt"],
      templateKind: "payment-receipt",
      idempotencyKey: options?.idempotencyKey,
    });
  });
}

export async function sendNewAppointmentDoctorEmail(
  data: DoctorNewAppointmentEmailData,
  options?: { idempotencyKey?: string },
): Promise<EmailSendResult> {
  return runSend(async () => {
    assertValidEmail(data.doctorEmail, "doctor email");
    assertRequiredString(data.doctorName, "doctorName");
    assertRequiredString(data.patientName, "patientName");
    assertRequiredString(data.bookingReference, "bookingReference");
    assertRequiredString(
      data.appointment.startsAtLabel,
      "appointment.startsAtLabel",
    );

    const dashboardUrl = optionalTrustedUrl(data.dashboardUrl, "dashboardUrl");
    const rendered = renderNewAppointmentDoctorEmail({ ...data, dashboardUrl });
    return sendEmail({
      to: { email: data.doctorEmail, name: data.doctorName },
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: ["doctor", "new-appointment"],
      templateKind: "doctor-new-appointment",
      idempotencyKey: options?.idempotencyKey,
    });
  });
}

export async function sendAppointmentCancelledDoctorEmail(
  data: DoctorAppointmentCancelledEmailData,
  options?: { idempotencyKey?: string },
): Promise<EmailSendResult> {
  return runSend(async () => {
    assertValidEmail(data.doctorEmail, "doctor email");
    assertRequiredString(data.doctorName, "doctorName");
    assertRequiredString(data.patientName, "patientName");
    assertRequiredString(data.bookingReference, "bookingReference");
    assertRequiredString(
      data.appointment.startsAtLabel,
      "appointment.startsAtLabel",
    );

    const dashboardUrl = optionalTrustedUrl(data.dashboardUrl, "dashboardUrl");
    const rendered = renderAppointmentCancelledDoctorEmail({
      ...data,
      dashboardUrl,
    });
    return sendEmail({
      to: { email: data.doctorEmail, name: data.doctorName },
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: ["doctor", "appointment-cancelled"],
      templateKind: "doctor-appointment-cancelled",
      idempotencyKey: options?.idempotencyKey,
    });
  });
}

export async function sendNewBookingAdminEmail(
  data: AdminNewBookingEmailData,
  options?: { idempotencyKey?: string },
): Promise<EmailSendResult> {
  return runSend(async () => {
    assertValidEmail(data.adminEmail, "admin email");
    assertRequiredString(data.patientName, "patientName");
    assertRequiredString(data.doctorName, "doctorName");
    assertRequiredString(data.bookingReference, "bookingReference");
    assertRequiredString(
      data.appointment.startsAtLabel,
      "appointment.startsAtLabel",
    );

    const dashboardUrl = optionalTrustedUrl(data.dashboardUrl, "dashboardUrl");
    const rendered = renderNewBookingAdminEmail({ ...data, dashboardUrl });
    return sendEmail({
      to: {
        email: data.adminEmail,
        name: data.adminName?.trim() || "Admin",
      },
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: ["admin", "new-booking"],
      templateKind: "admin-new-booking",
      idempotencyKey: options?.idempotencyKey,
    });
  });
}

export async function sendPaymentReceivedAdminEmail(
  data: AdminPaymentReceivedEmailData,
  options?: { idempotencyKey?: string },
): Promise<EmailSendResult> {
  return runSend(async () => {
    assertValidEmail(data.adminEmail, "admin email");
    assertRequiredString(data.patientName, "patientName");
    assertRequiredString(data.doctorName, "doctorName");
    assertRequiredString(data.bookingReference, "bookingReference");
    assertRequiredString(data.paymentReference, "paymentReference");
    assertRequiredString(data.paidAtLabel, "paidAtLabel");
    assertPositivePaise(data.amount.amountPaise);

    const dashboardUrl = optionalTrustedUrl(data.dashboardUrl, "dashboardUrl");
    const rendered = renderPaymentReceivedAdminEmail({ ...data, dashboardUrl });
    return sendEmail({
      to: {
        email: data.adminEmail,
        name: data.adminName?.trim() || "Admin",
      },
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: ["admin", "payment-received"],
      templateKind: "admin-payment-received",
      idempotencyKey: options?.idempotencyKey,
    });
  });
}

export async function sendDoctorInvitationEmail(
  data: DoctorInvitationEmailData,
  options?: { idempotencyKey?: string },
): Promise<EmailSendResult> {
  return runSend(async () => {
    assertValidEmail(data.inviteeEmail, "invitee email");
    assertRequiredString(data.inviteeName, "inviteeName");
    const invitationUrl = assertTrustedUrl(
      data.invitationUrl,
      appUrl(),
      "invitationUrl",
    );

    const rendered = renderDoctorInvitationEmail({ ...data, invitationUrl });
    return sendEmail({
      to: { email: data.inviteeEmail, name: data.inviteeName },
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: ["auth", "doctor-invitation"],
      templateKind: "doctor-invitation",
      idempotencyKey: options?.idempotencyKey,
    });
  });
}

export async function sendPasswordResetEmail(
  data: PasswordResetEmailData,
  options?: { idempotencyKey?: string },
): Promise<EmailSendResult> {
  return runSend(async () => {
    assertValidEmail(data.recipientEmail, "recipient email");
    assertRequiredString(data.recipientName, "recipientName");
    const resetUrl = assertTrustedUrl(data.resetUrl, appUrl(), "resetUrl");

    const rendered = renderPasswordResetEmail({ ...data, resetUrl });
    return sendEmail({
      to: { email: data.recipientEmail, name: data.recipientName },
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: ["auth", "password-reset"],
      templateKind: "password-reset",
      idempotencyKey: options?.idempotencyKey,
    });
  });
}
