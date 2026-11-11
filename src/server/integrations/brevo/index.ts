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
  sendStaffPasswordResetEmail,
  sendPasswordResetEmail,
} from "./services/senders";

export {
  sendTransactionalEmail,
  sendDoctorEmailVerificationOtp,
  sendDoctorLoginCredentialsEmail,
  BrevoNotConfiguredError,
  BrevoSendError,
} from "./send";

export { readBrevoConfig, createBrevoClient, sanitizeProviderError } from "./client";
export {
  getClinicConfig,
  getClinicConfigFromEnv,
  getBrevoConfig,
} from "./config";
export { BrevoError } from "./types";
export { EMAIL_THEME } from "./theme";

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
  StaffPasswordResetEmailData,
  PasswordResetEmailData,
} from "./types";

export type { BrevoClinicConfig, BrevoConfig } from "./config";

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
export {
  renderStaffPasswordResetEmail,
  renderPasswordResetEmail,
} from "./templates/auth/password-reset";

export { isValidEmail, assertValidEmail } from "./utils/email-validation";
export { formatInrFromPaise, escapeHtml } from "./utils/html";
