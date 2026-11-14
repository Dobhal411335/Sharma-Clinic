import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { resolveDoctorIdForUser } from "@/features/doctors/doctor-availability.service";
import { isDoctor } from "@/lib/auth/permissions";
import { jsonError } from "@/lib/razorpay/utils/http";

export async function requireDoctor(): Promise<
  | { ok: true; userId: string; doctorId: string }
  | { ok: false; response: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      response: jsonError(401, "UNAUTHORIZED", "Authentication required."),
    };
  }

  if (!isDoctor(session.user)) {
    return {
      ok: false,
      response: jsonError(403, "FORBIDDEN", "Doctor access required."),
    };
  }

  const doctorId =
    session.user.doctorId ?? (await resolveDoctorIdForUser(session.user.id));
  if (!doctorId) {
    return {
      ok: false,
      response: jsonError(
        404,
        "DOCTOR_NOT_LINKED",
        "Doctor profile is not linked to this account.",
      ),
    };
  }

  return { ok: true, userId: session.user.id, doctorId };
}
