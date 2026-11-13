export type BookingAppointmentStatus =
  | "PENDING_PAYMENT"
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW"
  | "EXPIRED";

export type BookingPaymentStatus =
  | "CREATED"
  | "ORDER_CREATED"
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "EXPIRED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"
  | "NONE";

export type BookingOrderSummary = {
  todayCount: number;
  paidCount: number;
  pendingAcceptanceCount: number;
  declinedCount: number;
  pendingPaymentCount: number;
};

export type BookingOrderListItem = {
  id: string;
  bookingReference: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string | null;
  doctorId: string;
  doctorName: string;
  startsAt: string;
  endsAt: string;
  feeSnapshotPaise: number;
  currency: string;
  appointmentStatus: BookingAppointmentStatus;
  paymentStatus: BookingPaymentStatus;
  reason: string | null;
  createdAt: string;
};

export type BookingOrderDetail = BookingOrderListItem & {
  accessToken: string;
  cancellationReason: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  updatedAt: string;
  medicalHistoryImageUrl: string | null;
  medicalHistoryImagePublicId: string | null;
  payment: {
    id: string;
    status: BookingPaymentStatus;
    amountPaise: number;
    providerOrderId: string | null;
    providerPaymentId: string | null;
    paidAt: string | null;
  } | null;
};

export type BookingOrderListResult = {
  summary: BookingOrderSummary;
  items: BookingOrderListItem[];
  doctors: Array<{ id: string; name: string }>;
};

export type BookingStatusUpdate = "PENDING" | "ACCEPTED" | "DECLINED";
