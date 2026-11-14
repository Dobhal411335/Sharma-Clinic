import { z } from "zod";

import {
  getDoctorBooking,
  updateDoctorBookingStatus,
} from "@/features/appointments/admin-bookings.service";
import { requireDoctor } from "@/lib/auth/require-doctor";
import { withRequestLogging } from "@/lib/logger";
import { jsonError, jsonSuccess } from "@/lib/razorpay/utils/http";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const patchSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "DECLINED", "COMPLETED", "NO_SHOW"]),
  reason: z.string().max(1000).optional(),
});

async function getHandler(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const authResult = await requireDoctor();
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;
  try {
    const data = await getDoctorBooking(authResult.doctorId, id);
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
  const authResult = await requireDoctor();
  if (!authResult.ok) return authResult.response;

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
      "status must be PENDING, ACCEPTED, DECLINED, COMPLETED, or NO_SHOW.",
    );
  }

  try {
    const data = await updateDoctorBookingStatus({
      doctorId: authResult.doctorId,
      id,
      status: parsed.data.status,
      reason: parsed.data.reason,
      actorUserId: authResult.userId,
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
  api: "doctor.bookings.get",
});

export const PATCH = withRequestLogging(patchHandler, {
  api: "doctor.bookings.patch",
});
