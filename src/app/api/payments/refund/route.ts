import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  logAuditEvent,
  setRequestUser,
  withRequestLogging,
} from "@/lib/logger";
import { refundPayment } from "@/lib/razorpay";
import {
  clientIpFromRequest,
  handleRazorpayRouteError,
  jsonError,
  jsonSuccess,
} from "@/lib/razorpay/utils/http";
import {
  PAYMENT_RATE_LIMITS,
  checkRateLimit,
} from "@/lib/razorpay/utils/rate-limit";

const bodySchema = z.object({
  paymentId: z.string().min(1),
  /** Omit for a full refund of the remaining refundable balance. */
  amountPaise: z.number().int().positive().optional(),
  reason: z.string().max(500).optional(),
  idempotencyKey: z.string().min(10).max(100).optional(),
});

/**
 * POST /api/payments/refund
 * ADMIN only (fail-closed). Full refund when amountPaise is omitted.
 */
async function postHandler(request: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  setRequestUser(auth.userId, "ADMIN");

  const ip = clientIpFromRequest(request);
  const limited = checkRateLimit({
    key: `refund:${auth.userId}:${ip}`,
    ...PAYMENT_RATE_LIMITS.refund,
  });
  if (!limited.allowed) {
    return jsonError(
      429,
      "RATE_LIMITED",
      `Too many requests. Retry after ${limited.retryAfterSec}s.`,
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Expected a JSON body.");
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return jsonError(
      400,
      "INVALID_BODY",
      "paymentId is required; amountPaise must be a positive integer when provided.",
    );
  }

  try {
    const data = await refundPayment(parsed.data);
    void logAuditEvent({
      action: "payment.refund_requested",
      entityType: "Payment",
      entityId: data.paymentId,
      actorUserId: auth.userId,
      metadata: {
        refundId: data.refundId,
        amountPaise: data.amountPaise,
        status: data.status,
        paymentStatus: data.paymentStatus,
        idempotentReplay: data.idempotentReplay,
      },
    });
    return jsonSuccess(data);
  } catch (error) {
    return handleRazorpayRouteError(error);
  }
}

export const POST = withRequestLogging(postHandler, {
  api: "payments.refund",
});
