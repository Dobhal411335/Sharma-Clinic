export { sendEmail } from "./services/send-email";

export {
  sendBookingReceivedEmail,
  sendAppointmentConfirmedEmail,
  sendAppointmentCancelledEmail,
  sendAppointmentRescheduledEmail,
  sendAppointmentReminderEmail,
  sendPaymentReceiptEmail,
  sendNewAppointmentDoctorEmail,
  sendAppointmentCancelledDoctorEmail,
  sendNewBookingAdminEmail,
  sendPaymentReceivedAdminEmail,
  sendDoctorInvitationEmail,
  sendPasswordResetEmail,
} from "./services/senders";

export { BrevoError } from "./types";

export type {
  EmailRecipient,
  RenderedEmail,
  EmailBodyContent,
  SendEmailInput,
  EmailSendResult,
  EmailSendSuccess,
  EmailSendFailure,
  EmailLogRecord,
  EmailTemplateKind,
  EmailDeliveryStatus,
  AppointmentSlot,
  MoneyAmountPaise,
  BookingReceivedEmailData,
  AppointmentConfirmedEmailData,
  AppointmentCancelledEmailData,
  AppointmentRescheduledEmailData,
  AppointmentReminderEmailData,
  PaymentReceiptEmailData,
  DoctorNewAppointmentEmailData,
  DoctorAppointmentCancelledEmailData,
  AdminNewBookingEmailData,
  AdminPaymentReceivedEmailData,
  DoctorInvitationEmailData,
  PasswordResetEmailData,
} from "./types";

/** Template renderers (for previews / tests — no network). */
export { renderBookingReceivedEmail } from "./templates/appointment/booking-received";
export { renderAppointmentConfirmedEmail } from "./templates/appointment/appointment-confirmed";
export { renderAppointmentCancelledEmail } from "./templates/appointment/appointment-cancelled";
export { renderAppointmentRescheduledEmail } from "./templates/appointment/appointment-rescheduled";
export { renderAppointmentReminderEmail } from "./templates/appointment/appointment-reminder";
export { renderPaymentReceiptEmail } from "./templates/appointment/payment-receipt";
export { renderNewAppointmentDoctorEmail } from "./templates/doctor/new-appointment";
export { renderAppointmentCancelledDoctorEmail } from "./templates/doctor/appointment-cancelled";
export { renderNewBookingAdminEmail } from "./templates/admin/new-booking";
export { renderPaymentReceivedAdminEmail } from "./templates/admin/payment-received";
export { renderDoctorInvitationEmail } from "./templates/auth/doctor-invitation";
export { renderPasswordResetEmail } from "./templates/auth/password-reset";

export { isValidEmail } from "./utils/email-validation";
export { formatInrFromPaise } from "./utils/html";
export { clearIdempotencyStore } from "./idempotency";
