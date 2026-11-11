import { z } from "zod";

import {
  getAdminBooking,
  updateAdminBookingStatus,
} from "@/features/appointments/admin-bookings.service";
import { requireAdmin } from "@/lib/auth/require-admin";
import { withRequestLogging } from "@/lib/logger";
import { jsonError, jsonSuccess } from "@/lib/razorpay/utils/http";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const patchSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "DECLINED"]),
  reason: z.string().max(1000).optional(),
});

async function getHandler(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  try {
    const data = await getAdminBooking(id);
    return jsonSuccess(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load booking.";
    const status = /not found/i.test(message) ? 404 : 400;
    return jsonError(status, "BOOKING_GET_FAILED", message);
  }
}

async function patchHandler(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Expected a JSON body.");
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return jsonError(
      400,
      "INVALID_BODY",
      "status must be PENDING, ACCEPTED, or DECLINED.",
    );
  }

  try {
    const data = await updateAdminBookingStatus({
      id,
      status: parsed.data.status,
      reason: parsed.data.reason,
      actorUserId: auth.userId,
    });
    return jsonSuccess(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update booking.";
    const status = /not found/i.test(message)
      ? 404
      : /cannot/i.test(message)
        ? 409
        : 400;
    return jsonError(status, "BOOKING_UPDATE_FAILED", message);
  }
}

export const GET = withRequestLogging(getHandler, {
  api: "admin.bookings.get",
});

export const PATCH = withRequestLogging(patchHandler, {
  api: "admin.bookings.patch",
});
