import { createHmac } from "node:crypto";
import type { Appointment, Doctor, Payment, Refund } from "@prisma/client";

export function makeDoctor(overrides: Partial<Doctor> = {}): Doctor {
  return {
    id: "doc_1",
    userId: "user_doc_1",
    displayName: "Dr Placeholder",
    consultationFeePaise: 50_000,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

export function makeAppointment(
  overrides: Partial<Appointment> = {},
): Appointment {
  return {
    id: "appt_1",
    bookingReference: "BOOK_1",
    doctorId: "doc_1",
    patientName: "Patient Placeholder",
    patientEmail: "patient@example.com",
    patientPhone: null,
    startsAt: new Date("2026-02-01T04:30:00.000Z"),
    endsAt: null,
    status: "PENDING_PAYMENT",
    feeSnapshotPaise: 50_000,
    currency: "INR",
    accessToken: "access_token_1",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

export function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: "pay_local_1",
    appointmentId: "appt_1",
    attemptNumber: 1,
    idempotencyKey: "pay_idem_1",
    provider: "RAZORPAY",
    providerOrderId: "order_1",
    providerPaymentId: null,
    amountPaise: 50_000,
    currency: "INR",
    feeSnapshotPaise: 50_000,
    doctorFeePaise: 50_000,
    status: "ORDER_CREATED",
    failureReason: null,
    paidAt: null,
    activeAppointmentId: "appt_1",
    needsReconciliation: false,
    reconciliationNote: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

export function makeRefund(overrides: Partial<Refund> = {}): Refund {
  return {
    id: "refund_1",
    paymentId: "pay_local_1",
    providerRefundId: null,
    idempotencyKey: "ref_idem_1",
    amountPaise: 50_000,
    status: "PENDING",
    reason: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

export function signPayment(
  orderId: string,
  paymentId: string,
  keySecret: string,
): string {
  return createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

export function signWebhook(rawBody: string, webhookSecret: string): string {
  return createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
}
