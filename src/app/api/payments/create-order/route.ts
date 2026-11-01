import { z } from "zod";

import { withRequestLogging } from "@/lib/logger";
import { createOrder } from "@/lib/razorpay";
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
  appointmentId: z.string().min(1),
});

/**
 * POST /api/payments/create-order
 * Body: { appointmentId }
 * Returns Checkout fields. Amount comes from DB fee snapshot only.
 */
async function postHandler(request: Request): Promise<Response> {
  const ip = clientIpFromRequest(request);
  const limited = checkRateLimit({
    key: `create-order:${ip}`,
    ...PAYMENT_RATE_LIMITS.createOrder,
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
    return jsonError(400, "INVALID_BODY", "appointmentId is required.");
  }

  try {
    const data = await createOrder(parsed.data.appointmentId);
    return jsonSuccess(data, 201);
  } catch (error) {
    return handleRazorpayRouteError(error);
  }
}

export const POST = withRequestLogging(postHandler, {
  api: "payments.create-order",
});
