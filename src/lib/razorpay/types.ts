import type { PaymentStatus, RefundStatus } from "@prisma/client";

export const RAZORPAY_CURRENCY = "INR" as const;

/**
 * Capture mode: automatic capture at Checkout (`payment_capture: 1`).
 * Orders are created without auth-only hold. `capturePayment` exists for
 * rare authorized-but-uncaptured webhook races.
 */
export const RAZORPAY_CAPTURE_MODE = "automatic" as const;

export const ACTIVE_PAYMENT_STATUSES = [
  "CREATED",
  "ORDER_CREATED",
  "PENDING",
] as const satisfies readonly PaymentStatus[];

export type ActivePaymentStatus = (typeof ACTIVE_PAYMENT_STATUSES)[number];

export const TERMINAL_PAYMENT_STATUSES = [
  "PAID",
  "FAILED",
  "EXPIRED",
  "REFUNDED",
] as const satisfies readonly PaymentStatus[];

export type TerminalPaymentStatus = (typeof TERMINAL_PAYMENT_STATUSES)[number];

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  publicKeyId: string;
}

export interface CreateOrderResult {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: typeof RAZORPAY_CURRENCY;
  keyId: string;
}

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResult {
  paymentId: string;
  appointmentId: string;
  status: PaymentStatus;
  amountPaise: number;
  currency: string;
  alreadyVerified: boolean;
}

export interface PaymentStatusResult {
  appointmentId: string;
  appointmentStatus: string;
  paymentStatus: PaymentStatus | null;
  paymentId: string | null;
  amountPaise: number | null;
  currency: string | null;
  paidAt: string | null;
  needsReconciliation: boolean;
}

export interface RefundPaymentInput {
  paymentId: string;
  amountPaise?: number;
  reason?: string;
  /** When omitted, a new key is generated. Retries should reuse the same key. */
  idempotencyKey?: string;
}

export interface RefundPaymentResult {
  refundId: string;
  paymentId: string;
  providerRefundId: string | null;
  amountPaise: number;
  status: RefundStatus;
  paymentStatus: PaymentStatus;
  idempotentReplay: boolean;
}

export interface CapturePaymentResult {
  paymentId: string;
  providerPaymentId: string;
  status: PaymentStatus;
  captured: boolean;
}

export interface FetchPaymentResult {
  providerPaymentId: string;
  providerOrderId: string | null;
  amountPaise: number;
  currency: string;
  status: string;
  captured: boolean;
  amountRefundedPaise: number;
}

export interface ReconcilePaymentResult {
  paymentId: string;
  status: PaymentStatus;
  changed: boolean;
  needsReconciliation: boolean;
  note: string | null;
}

export interface RazorpayOrderEntity {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string | null;
}

export interface RazorpayPaymentEntity {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: string;
  captured: boolean | string | number | null;
  amount_refunded?: number;
  error_description?: string | null;
  error_code?: string | null;
}

export interface RazorpayRefundEntity {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
}

export type RazorpayWebhookEventType =
  | "payment.authorized"
  | "payment.captured"
  | "payment.failed"
  | "order.paid"
  | "refund.created"
  | "refund.processed"
  | "refund.failed"
  | string;

export interface RazorpayWebhookPayload {
  entity: string;
  account_id?: string;
  event: RazorpayWebhookEventType;
  contains?: string[];
  payload: {
    payment?: { entity: RazorpayPaymentEntity };
    order?: { entity: RazorpayOrderEntity };
    refund?: { entity: RazorpayRefundEntity };
  };
  created_at?: number;
}

export interface ProcessWebhookResult {
  eventId: string;
  eventType: string;
  processingStatus: "PROCESSED" | "IGNORED" | "FAILED" | "DUPLICATE";
  message: string;
}

export class RazorpayIntegrationError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 400) {
    super(message);
    this.name = "RazorpayIntegrationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

/** Prepared shape for a future email/notification outbox — not persisted yet. */
export interface PaymentNotificationOutboxItem {
  kind: "payment-receipt" | "appointment-confirmed" | "admin-payment-received";
  appointmentId: string;
  paymentId: string;
  idempotencyKey: string;
  createdAt: Date;
}
