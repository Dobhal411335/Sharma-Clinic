import { db } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";

import {
  RazorpayIntegrationError,
  type ReconcilePaymentResult,
} from "../types";
import {
  mapRazorpayPaymentStatusToLocal,
  resolvePaymentTransition,
} from "../utils/payment-status";
import { fetchPayment } from "./fetch-payment";
import { markPaymentFailed, markPaymentPaid } from "./mark-paid";

function logReconcileResult(
  result: ReconcilePaymentResult,
  appointmentId: string,
): ReconcilePaymentResult {
  if (result.changed || result.needsReconciliation) {
    logger.info("Payment reconcile result", {
      module: "razorpay",
      function: "reconcilePayment",
      paymentId: result.paymentId,
      appointmentId,
      meta: {
        status: result.status,
        changed: result.changed,
        needsReconciliation: result.needsReconciliation,
        note: result.note,
      },
    });
  }
  return result;
}

/**
 * Reconciles local payment state against Razorpay.
 * Never downgrades PAID based on stale remote state.
 */
export async function reconcilePayment(
  paymentId: string,
): Promise<ReconcilePaymentResult> {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new RazorpayIntegrationError(
      "Payment not found.",
      "PAYMENT_NOT_FOUND",
      404,
    );
  }

  if (!payment.providerPaymentId && !payment.providerOrderId) {
    return logReconcileResult(
      {
        paymentId: payment.id,
        status: payment.status,
        changed: false,
        needsReconciliation: payment.needsReconciliation,
        note: "No provider identifiers to reconcile.",
      },
      payment.appointmentId,
    );
  }

  if (!payment.providerPaymentId) {
    return logReconcileResult(
      {
        paymentId: payment.id,
        status: payment.status,
        changed: false,
        needsReconciliation: payment.needsReconciliation,
        note: "providerPaymentId missing; waiting for checkout/webhook.",
      },
      payment.appointmentId,
    );
  }

  const remote = await fetchPayment(payment.providerPaymentId);
  const mapped = mapRazorpayPaymentStatusToLocal(remote.status, remote.captured);

  if (!mapped) {
    return logReconcileResult(
      {
        paymentId: payment.id,
        status: payment.status,
        changed: false,
        needsReconciliation: true,
        note: `Unrecognized Razorpay status: ${remote.status}`,
      },
      payment.appointmentId,
    );
  }

  if (remote.amountPaise !== payment.amountPaise) {
    logger.warn("Reconcile amount mismatch flagged", {
      module: "razorpay",
      function: "reconcilePayment",
      paymentId: payment.id,
      appointmentId: payment.appointmentId,
      meta: {
        localAmountPaise: payment.amountPaise,
        remoteAmountPaise: remote.amountPaise,
      },
    });
    await db.payment.update({
      where: { id: payment.id },
      data: {
        needsReconciliation: true,
        reconciliationNote: `Amount mismatch during reconcile. local=${payment.amountPaise} remote=${remote.amountPaise}`,
      },
    });

    return logReconcileResult(
      {
        paymentId: payment.id,
        status: payment.status,
        changed: false,
        needsReconciliation: true,
        note: "Amount mismatch flagged for reconciliation.",
      },
      payment.appointmentId,
    );
  }

  if (mapped === "PAID") {
    if (payment.status === "PAID") {
      return {
        paymentId: payment.id,
        status: "PAID",
        changed: false,
        needsReconciliation: payment.needsReconciliation,
        note: null,
      };
    }

    const marked = await markPaymentPaid({
      paymentId: payment.id,
      providerPaymentId: remote.providerPaymentId,
      providerOrderId: remote.providerOrderId,
      source: "reconcile",
    });

    return logReconcileResult(
      {
        paymentId: marked.payment.id,
        status: marked.payment.status,
        changed: marked.newlyPaid,
        needsReconciliation: marked.payment.needsReconciliation,
        note: marked.newlyPaid ? "Marked PAID from reconcile." : null,
      },
      payment.appointmentId,
    );
  }

  if (mapped === "FAILED" || mapped === "EXPIRED") {
    const transition = resolvePaymentTransition(payment.status, mapped);
    if (!transition.apply) {
      return logReconcileResult(
        {
          paymentId: payment.id,
          status: payment.status,
          changed: false,
          needsReconciliation: payment.needsReconciliation,
          note: transition.ignoreStale
            ? "Ignored stale failure against PAID/REFUNDED payment."
            : null,
        },
        payment.appointmentId,
      );
    }

    const updated = await markPaymentFailed({
      paymentId: payment.id,
      status: mapped,
      reason: "Reconciled as failed from Razorpay.",
      providerPaymentId: remote.providerPaymentId,
    });

    return logReconcileResult(
      {
        paymentId: updated.id,
        status: updated.status,
        changed: updated.status !== payment.status,
        needsReconciliation: updated.needsReconciliation,
        note: "Marked failed from reconcile.",
      },
      payment.appointmentId,
    );
  }

  if (mapped === "PENDING" && payment.status === "ORDER_CREATED") {
    const updated = await db.payment.update({
      where: { id: payment.id },
      data: {
        status: "PENDING",
        providerPaymentId: remote.providerPaymentId,
        activeAppointmentId: payment.appointmentId,
      },
    });

    return logReconcileResult(
      {
        paymentId: updated.id,
        status: updated.status,
        changed: true,
        needsReconciliation: updated.needsReconciliation,
        note: "Moved to PENDING from reconcile.",
      },
      payment.appointmentId,
    );
  }

  return {
    paymentId: payment.id,
    status: payment.status,
    changed: false,
    needsReconciliation: payment.needsReconciliation,
    note: null,
  };
}
