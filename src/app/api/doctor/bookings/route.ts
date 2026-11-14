import { z } from "zod";

import { listDoctorBookings } from "@/features/appointments/admin-bookings.service";
import { requireDoctor } from "@/lib/auth/require-doctor";
import { withRequestLogging } from "@/lib/logger";
import { jsonError, jsonSuccess } from "@/lib/razorpay/utils/http";

const querySchema = z.object({
  status: z
    .enum([
      "ALL",
      "PENDING_PAYMENT",
      "PENDING",
      "ACCEPTED",
      "DECLINED",
      "CANCELLED",
      "COMPLETED",
      "NO_SHOW",
      "EXPIRED",
    ])
    .optional()
    .default("ALL"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

async function getHandler(request: Request): Promise<Response> {
  const authResult = await requireDoctor();
  if (!authResult.ok) return authResult.response;

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    status: url.searchParams.get("status") ?? "ALL",
    date: url.searchParams.get("date") || undefined,
  });
  if (!parsed.success) {
    return jsonError(400, "INVALID_QUERY", "Invalid booking filters.");
  }

  try {
    const data = await listDoctorBookings(authResult.doctorId, parsed.data);
    return jsonSuccess(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load bookings.";
    return jsonError(400, "BOOKINGS_LIST_FAILED", message);
  }
}

export const GET = withRequestLogging(getHandler, {
  api: "doctor.bookings.list",
});
