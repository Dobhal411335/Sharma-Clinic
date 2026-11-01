import { z } from "zod";

import { withRequestLogging } from "@/lib/logger";
import { verifyPayment } from "@/lib/razorpay";
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
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/**
 * POST /api/payments/verify
 * Verifies Checkout signature server-side. Never trust browser payment status alone.
 */
async function postHandler(request: Request): Promise<Response> {
  const ip = clientIpFromRequest(request);
  const limited = checkRateLimit({
    key: `verify:${ip}`,
    ...PAYMENT_RATE_LIMITS.verify,
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
      "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.",
    );
  }

  try {
    const data = await verifyPayment(parsed.data);
    return jsonSuccess(data);
  } catch (error) {
    return handleRazorpayRouteError(error);
  }
}

export const POST = withRequestLogging(postHandler, {
  api: "payments.verify",
});
