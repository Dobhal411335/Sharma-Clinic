export type EmailTemplateKind =
  | "booking-received"
  | "appointment-confirmed"
  | "appointment-cancelled"
  | "appointment-rescheduled"
  | "appointment-reminder"
  | "payment-receipt"
  | "doctor-new-appointment"
  | "doctor-appointment-cancelled"
  | "admin-new-booking"
  | "admin-payment-received"
  | "doctor-invitation"
  | "password-reset";

export type EmailDeliveryStatus =
  | "pending"
  | "sent"
  | "failed"
  | "skipped_duplicate";

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface EmailBodyContent {
  title: string;
  preheader?: string;
  htmlBody: string;
  textBody: string;
}

export interface SendEmailInput {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text: string;
  tags?: string[];
  /** Optional dedupe key independent of Brevo; prepares for future EmailLog. */
  idempotencyKey?: string;
  replyTo?: EmailRecipient;
  templateKind?: EmailTemplateKind;
}

export interface EmailSendSuccess {
  ok: true;
  messageId: string;
  idempotentReplay?: boolean;
}

export interface EmailSendFailure {
  ok: false;
  code: string;
  message: string;
}

export type EmailSendResult = EmailSendSuccess | EmailSendFailure;

/**
 * Shape prepared for a future Prisma EmailLog model.
 * Do not persist from this module yet — no migration.
 */
export interface EmailLogRecord {
  id?: string;
  templateKind: EmailTemplateKind;
  recipientEmail: string;
  recipientName?: string | null;
  subject: string;
  status: EmailDeliveryStatus;
  provider: "brevo";
  providerMessageId?: string | null;
  idempotencyKey?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  metadata?: Record<string, string | number | boolean | null> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentParty {
  name: string;
  email?: string;
}

export interface AppointmentSlot {
  /** ISO-8601 UTC timestamp preferred; display formatted by callers/templates. */
  startsAtLabel: string;
  endsAtLabel?: string;
  timezoneLabel?: string;
}

export interface MoneyAmountPaise {
  /** Integer minor units (paise). Never use floats for money. */
  amountPaise: number;
  currency?: "INR";
}

export interface BookingReceivedEmailData {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  appointment: AppointmentSlot;
  bookingReference: string;
  notes?: string;
}

export interface AppointmentConfirmedEmailData {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  appointment: AppointmentSlot;
  bookingReference: string;
  locationLabel?: string;
  manageUrl?: string;
}

export interface AppointmentCancelledEmailData {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  appointment: AppointmentSlot;
  bookingReference: string;
  cancellationReason?: string;
  rebookUrl?: string;
}

export interface AppointmentRescheduledEmailData {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  bookingReference: string;
  previousAppointment: AppointmentSlot;
  newAppointment: AppointmentSlot;
  manageUrl?: string;
}

export interface AppointmentReminderEmailData {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  appointment: AppointmentSlot;
  bookingReference: string;
  locationLabel?: string;
  manageUrl?: string;
}

export interface PaymentReceiptEmailData {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  bookingReference: string;
  paymentReference: string;
  amount: MoneyAmountPaise;
  paidAtLabel: string;
  appointment?: AppointmentSlot;
  receiptUrl?: string;
}

export interface DoctorNewAppointmentEmailData {
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  appointment: AppointmentSlot;
  bookingReference: string;
  notes?: string;
  dashboardUrl?: string;
}

export interface DoctorAppointmentCancelledEmailData {
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  appointment: AppointmentSlot;
  bookingReference: string;
  cancellationReason?: string;
  dashboardUrl?: string;
}

export interface AdminNewBookingEmailData {
  adminEmail: string;
  adminName?: string;
  patientName: string;
  doctorName: string;
  appointment: AppointmentSlot;
  bookingReference: string;
  dashboardUrl?: string;
}

export interface AdminPaymentReceivedEmailData {
  adminEmail: string;
  adminName?: string;
  patientName: string;
  doctorName: string;
  bookingReference: string;
  paymentReference: string;
  amount: MoneyAmountPaise;
  paidAtLabel: string;
  dashboardUrl?: string;
}

export interface DoctorInvitationEmailData {
  inviteeName: string;
  inviteeEmail: string;
  /** Opaque absolute HTTPS invitation URL — never include passwords. */
  invitationUrl: string;
  invitedByName?: string;
  expiresAtLabel?: string;
}

export interface PasswordResetEmailData {
  recipientName: string;
  recipientEmail: string;
  /** Opaque absolute HTTPS reset URL — never include passwords or tokens in plain text. */
  resetUrl: string;
  expiresAtLabel?: string;
}

export class BrevoError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 400) {
    super(message);
    this.name = "BrevoError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
