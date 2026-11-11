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
  | "staff-password-reset"
  | "doctor.email_verification"
  | "doctor.login_credentials";

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
  /** Optional dedupe key independent of Brevo; backed by EmailLog. */
  idempotencyKey?: string;
  referenceId?: string;
  replyTo?: EmailRecipient;
  templateKind?: EmailTemplateKind;
  headers?: Record<string, string>;
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
 * Shape aligned with Prisma EmailLog (bodies are never stored).
 */
export interface EmailLogRecord {
  id?: string;
  templateKind: EmailTemplateKind | string;
  recipientEmail: string;
  recipientName?: string | null;
  subject: string;
  status: EmailDeliveryStatus;
  provider: "brevo";
  providerMessageId?: string | null;
  referenceId?: string | null;
  idempotencyKey?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  metadata?: Record<string, string | number | boolean | null> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentSlot {
  /** Display-ready appointment start label (clinic timezone). */
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
  /** Current booking status label (e.g. Awaiting payment / Pending confirmation). */
  bookingStatus?: string;
  paymentStatus?: string;
  nextSteps?: string;
  notes?: string;
}

export interface AppointmentConfirmedEmailData {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  appointment: AppointmentSlot;
  bookingReference: string;
  locationLabel?: string;
  paymentInfo?: string;
  visitInstructions?: string;
  manageUrl?: string;
}

export interface AppointmentCancelledEmailData {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  appointment: AppointmentSlot;
  bookingReference: string;
  cancellationReason?: string;
  refundInfo?: string;
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
  reminderInstructions?: string;
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
  paymentStatus?: string;
  appointment?: AppointmentSlot;
  receiptUrl?: string;
}

export interface DoctorNewAppointmentEmailData {
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  /** Include only when permitted by privacy policy. */
  patientEmail?: string;
  patientPhone?: string;
  appointment: AppointmentSlot;
  bookingReference: string;
  bookingStatus?: string;
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
  patientEmail?: string;
  patientPhone?: string;
  doctorName: string;
  appointment: AppointmentSlot;
  bookingReference: string;
  bookingStatus?: string;
  paymentStatus?: string;
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

export interface StaffPasswordResetEmailData {
  recipientName: string;
  recipientEmail: string;
  /** Opaque absolute HTTPS reset URL — never include passwords or tokens in plain text. */
  resetUrl: string;
  expiresAtLabel?: string;
}

/** @deprecated Use StaffPasswordResetEmailData */
export type PasswordResetEmailData = StaffPasswordResetEmailData;

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
