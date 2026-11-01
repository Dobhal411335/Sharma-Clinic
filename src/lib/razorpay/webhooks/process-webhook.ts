import { Prisma } from "@prisma/client";

import { db } from "@/lib/db/prisma";
import {
  logExternalServiceError,
  logger,
} from "@/lib/logger";

import {
  RazorpayIntegrationError,
  type ProcessWebhookResult,
  type RazorpayWebhookPayload,
} from "../types";
import { markPaymentFailed, markPaymentPaid } from "../services/mark-paid";
import { resolvePaymentTransition } from "../utils/payment-status";

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function findPaymentForWebhook(payload: RazorpayWebhookPayload) {
  const paymentEntity = payload.payload.payment?.entity;
  const orderEntity = payload.payload.order?.entity;
  const refundEntity = payload.payload.refund?.entity;

  if (paymentEntity?.order_id) {
    const byOrder = await db.payment.findFirst({
      where: { providerOrderId: paymentEntity.order_id },
    });
    if (byOrder) {
      return byOrder;
    }
  }

  if (paymentEntity?.id) {
    const byPayment = await db.payment.findFirst({
      where: { providerPaymentId: paymentEntity.id },
    });
    if (byPayment) {
      return byPayment;
    }
  }

  if (orderEntity?.id) {
    const byOrder = await db.payment.findFirst({
      where: { providerOrderId: orderEntity.id },
    });
    if (byOrder) {
      return byOrder;
    }
  }

  if (refundEntity?.payment_id) {
    const byPayment = await db.payment.findFirst({
      where: { providerPaymentId: refundEntity.payment_id },
    });
    if (byPayment) {
      return byPayment;
    }
  }

  return null;
}

async function handlePaymentSuccess(
  payload: RazorpayWebhookPayload,
): Promise<string> {
  const entity = payload.payload.payment?.entity;
  if (!entity?.id) {
    return "Missing payment entity.";
  }

  const payment = await findPaymentForWebhook(payload);
  if (!payment) {
    return "No local payment matched; ignored.";
  }

  if (
    typeof entity.amount === "number" &&
    entity.amount !== payment.amountPaise
  ) {
    logger.warn("Webhook amount mismatch flagged", {
      module: "razorpay",
      function: "handlePaymentSuccess",
      paymentId: payment.id,
      appointmentId: payment.appointmentId,
      meta: {
        localAmountPaise: payment.amountPaise,
        remoteAmountPaise: entity.amount,
      },
    });
    await db.payment.update({
      where: { id: payment.id },
      data: {
        needsReconciliation: true,
        reconciliationNote: `Webhook amount mismatch. local=${payment.amountPaise} remote=${entity.amount}`,
      },
    });
    return "Amount mismatch flagged.";
  }

  await markPaymentPaid({
    paymentId: payment.id,
    providerPaymentId: entity.id,
    providerOrderId: entity.order_id,
    source: "webhook",
  });

  return "Payment marked PAID.";
}

async function handlePaymentFailed(
  payload: RazorpayWebhookPayload,
): Promise<string> {
  const entity = payload.payload.payment?.entity;
  const payment = await findPaymentForWebhook(payload);
  if (!payment) {
    return "No local payment matched; ignored.";
  }

  const transition = resolvePaymentTransition(payment.status, "FAILED");
  if (!transition.apply) {
    return "Ignored stale failure (payment already terminal/PAID).";
  }

  await markPaymentFailed({
    paymentId: payment.id,
    status: "FAILED",
    reason: entity?.error_description ?? "payment.failed webhook",
    providerPaymentId: entity?.id,
  });

  return "Payment marked FAILED.";
}

async function handleRefundEvent(
  payload: RazorpayWebhookPayload,
): Promise<string> {
  const refund = payload.payload.refund?.entity;
  if (!refund?.id) {
    return "Missing refund entity.";
  }

  const payment = await findPaymentForWebhook(payload);
  if (!payment) {
    return "No local payment matched; ignored.";
  }

  const existing = await db.refund.findFirst({
    where: {
      OR: [
        { providerRefundId: refund.id },
        {
          paymentId: payment.id,
          amountPaise: refund.amount,
          status: { in: ["PENDING", "PROCESSED"] },
        },
      ],
    },
  });

  const status =
    payload.event === "refund.failed"
      ? "FAILED"
      : payload.event === "refund.processed"
        ? "PROCESSED"
        : "PENDING";

  if (existing) {
    // Never revert PROCESSED → FAILED on out-of-order events for completed refunds
    // if a later processed already applied — but FAILED after PENDING is ok.
    if (existing.status === "PROCESSED" && status === "FAILED") {
      return "Ignored stale refund.failed after PROCESSED.";
    }

    await db.refund.update({
      where: { id: existing.id },
      data: {
        providerRefundId: refund.id,
        status,
      },
    });
  } else {
    await db.refund.create({
      data: {
        paymentId: payment.id,
        providerRefundId: refund.id,
        idempotencyKey: `wh_ref_${refund.id}`,
        amountPaise: refund.amount,
        status,
        reason: `Webhook ${payload.event}`,
      },
    });
  }

  if (status === "PROCESSED" || status === "PENDING") {
    const refunds = await db.refund.findMany({
      where: {
        paymentId: payment.id,
        status: { in: ["PENDING", "PROCESSED"] },
      },
    });
    const total = refunds.reduce((sum, r) => sum + r.amountPaise, 0);
    if (total >= payment.amountPaise && payment.status === "PAID") {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "REFUNDED",
          activeAppointmentId: null,
        },
      });
    }
  }

  return `Refund event ${payload.event} applied.`;
}

/**
 * Processes a verified Razorpay webhook using an event-id inbox
 * (`providerEventId` unique). Duplicates are ignored. Out-of-order events
 * never downgrade PAID → FAILED.
 */
export async function processWebhook(input: {
  eventId: string;
  payload: RazorpayWebhookPayload;
}): Promise<ProcessWebhookResult> {
  const eventId = input.eventId?.trim();
  if (!eventId) {
    throw new RazorpayIntegrationError(
      "Missing x-razorpay-event-id header.",
      "WEBHOOK_EVENT_ID_MISSING",
      400,
    );
  }

  try {
    await db.paymentWebhookEvent.create({
      data: {
        providerEventId: eventId,
        eventType: input.payload.event,
        processingStatus: "RECEIVED",
        payload: input.payload as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      logger.info("Duplicate webhook event ignored", {
        module: "razorpay",
        function: "processWebhook",
        meta: {
          eventId,
          eventType: input.payload.event,
          duplicateDetected: true,
        },
      });
      return {
        eventId,
        eventType: input.payload.event,
        processingStatus: "DUPLICATE",
        message: "Duplicate webhook event ignored.",
      };
    }
    throw error;
  }

  try {
    let message: string;
    switch (input.payload.event) {
      case "payment.authorized":
      case "payment.captured":
      case "order.paid":
        message = await handlePaymentSuccess(input.payload);
        break;
      case "payment.failed":
        message = await handlePaymentFailed(input.payload);
        break;
      case "refund.created":
      case "refund.processed":
      case "refund.failed":
        message = await handleRefundEvent(input.payload);
        break;
      default:
        await db.paymentWebhookEvent.update({
          where: { providerEventId: eventId },
          data: {
            processingStatus: "IGNORED",
            processedAt: new Date(),
            failureReason: `Unhandled event type: ${input.payload.event}`,
          },
        });
        logger.info("Unhandled webhook event type ignored", {
          module: "razorpay",
          function: "processWebhook",
          meta: { eventId, eventType: input.payload.event },
        });
        return {
          eventId,
          eventType: input.payload.event,
          processingStatus: "IGNORED",
          message: `Unhandled event type: ${input.payload.event}`,
        };
    }

    await db.paymentWebhookEvent.update({
      where: { providerEventId: eventId },
      data: {
        processingStatus: "PROCESSED",
        processedAt: new Date(),
      },
    });

    logger.info("Webhook processed", {
      module: "razorpay",
      function: "processWebhook",
      meta: {
        eventId,
        eventType: input.payload.event,
        processingStatus: "PROCESSED",
      },
    });

    return {
      eventId,
      eventType: input.payload.event,
      processingStatus: "PROCESSED",
      message,
    };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message.slice(0, 500) : "Webhook failed";

    logExternalServiceError("razorpay", error, {
      module: "razorpay",
      function: "processWebhook",
      meta: { eventId, eventType: input.payload.event },
    });

    await db.paymentWebhookEvent.update({
      where: { providerEventId: eventId },
      data: {
        processingStatus: "FAILED",
        processedAt: new Date(),
        failureReason: reason,
      },
    });

    return {
      eventId,
      eventType: input.payload.event,
      processingStatus: "FAILED",
      message: reason,
    };
  }
}
