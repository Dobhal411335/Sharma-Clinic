import { z } from "zod";

import { listAdminBookings } from "@/features/appointments/admin-bookings.service";
import { requireAdmin } from "@/lib/auth/require-admin";
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
  doctorId: z.string().min(1).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

async function getHandler(request: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    status: url.searchParams.get("status") ?? "ALL",
    doctorId: url.searchParams.get("doctorId") || undefined,
    date: url.searchParams.get("date") || undefined,
  });
  if (!parsed.success) {
    return jsonError(400, "INVALID_QUERY", "Invalid booking filters.");
  }

  try {
    const data = await listAdminBookings(parsed.data);
    return jsonSuccess(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load bookings.";
    return jsonError(400, "BOOKINGS_LIST_FAILED", message);
  }
}

export const GET = withRequestLogging(getHandler, {
  api: "admin.bookings.list",
});
