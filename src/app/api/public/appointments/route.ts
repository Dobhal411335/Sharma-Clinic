import { z } from "zod";

import { notifyFreeBookingReceived } from "@/features/appointments/booking-notifications";
import { createPublicAppointment } from "@/features/appointments/public-booking.service";
import { withRequestLogging } from "@/lib/logger";
import {
  clientIpFromRequest,
  jsonError,
  jsonSuccess,
} from "@/lib/razorpay/utils/http";
import {
  PAYMENT_RATE_LIMITS,
  checkRateLimit,
} from "@/lib/razorpay/utils/rate-limit";

const bodySchema = z.object({
  doctorId: z.string().min(1),
  patientName: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().min(8).max(20),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  problem: z.string().max(5000).optional(),
  medicalHistoryImageUrl: z.string().url().max(2000).optional().or(z.literal("")),
  medicalHistoryImagePublicId: z.string().max(500).optional(),
  website: z.string().max(200).optional(),
});

async function postHandler(request: Request): Promise<Response> {
  const ip = clientIpFromRequest(request);
  const limited = checkRateLimit({
    key: `public-appointments:${ip}`,
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
    const firstIssue = parsed.error.issues[0];
    const detail = firstIssue
      ? `${firstIssue.path.join(".") || "body"}: ${firstIssue.message}`
      : "Invalid appointment payload.";
    return jsonError(400, "INVALID_BODY", detail);
  }

  try {
    const data = await createPublicAppointment({
      ...parsed.data,
      medicalHistoryImageUrl:
        parsed.data.medicalHistoryImageUrl?.trim() || undefined,
      medicalHistoryImagePublicId:
        parsed.data.medicalHistoryImagePublicId?.trim() || undefined,
    });
    if (!data.requiresPayment) {
      void notifyFreeBookingReceived(data.appointmentId).catch(() => undefined);
    }
    return jsonSuccess(data, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create appointment.";
    const status = /not found/i.test(message)
      ? 404
      : /just booked|not available|past/i.test(message)
        ? 409
        : 400;
    return jsonError(status, "BOOKING_FAILED", message);
  }
}

export const POST = withRequestLogging(postHandler, {
  api: "public.appointments.create",
});
