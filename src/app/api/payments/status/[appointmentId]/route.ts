import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/config";
import { hasRole } from "@/lib/auth/authorization";
import { db } from "@/lib/db/prisma";
import {
  setRequestUser,
  withRequestLogging,
  type ApiRouteContext,
} from "@/lib/logger";
import { getPaymentStatusForAppointment } from "@/lib/razorpay";
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

/**
 * GET /api/payments/status/[appointmentId]
 * Limited non-sensitive status. Optional ?accessToken= for ownership.
 * Doctors may only read their own appointments.
 */
async function getHandler(
  request: Request,
  context: ApiRouteContext,
): Promise<Response> {
  const ip = clientIpFromRequest(request);
  const limited = checkRateLimit({
    key: `status:${ip}`,
    ...PAYMENT_RATE_LIMITS.status,
  });
  if (!limited.allowed) {
    return jsonError(
      429,
      "RATE_LIMITED",
      `Too many requests. Retry after ${limited.retryAfterSec}s.`,
    );
  }

  const rawParams = context.params;
  const params =
    rawParams && typeof (rawParams as Promise<unknown>).then === "function"
      ? await (rawParams as Promise<Record<string, string | string[]>>)
      : ((rawParams as Record<string, string | string[]> | undefined) ?? {});
  const appointmentIdRaw = params.appointmentId;
  const appointmentId = Array.isArray(appointmentIdRaw)
    ? appointmentIdRaw[0]
    : appointmentIdRaw;

  if (!appointmentId) {
    return jsonError(400, "INVALID_APPOINTMENT_ID", "appointmentId is required.");
  }

  const url = new URL(request.url);
  const accessToken = url.searchParams.get("accessToken") ?? undefined;

  try {
    const session = await getServerSession(authOptions);
    let doctorId: string | undefined;

    if (session?.user) {
      setRequestUser(session.user.id, session.user.role);
    }

    if (session?.user && hasRole(session, "DOCTOR")) {
      const doctor = await db.doctor.findFirst({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!doctor) {
        return jsonError(
          403,
          "DOCTOR_PROFILE_MISSING",
          "Doctor profile not linked.",
        );
      }
      doctorId = doctor.id;
    }

    // ADMIN can read any; DOCTOR is scoped; public uses opaque id (+ optional token).
    const data = await getPaymentStatusForAppointment(appointmentId, {
      accessToken,
      doctorId: hasRole(session, "ADMIN") ? undefined : doctorId,
    });

    return jsonSuccess(data);
  } catch (error) {
    return handleRazorpayRouteError(error);
  }
}

export const GET = withRequestLogging(getHandler, {
  api: "payments.status",
});
