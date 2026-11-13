import { ZodError } from "zod";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getDoctorAvailability,
  replaceDoctorAvailability,
  resolveDoctorIdForUser,
} from "@/features/doctors/doctor-availability.service";
import { jsonData, jsonMessage, readJson, zodMessage } from "@/features/cms/http";
import { isDoctor } from "@/lib/auth/permissions";
import { doctorAvailabilityBodySchema } from "@/lib/doctor-availability-schema";

async function requireDoctorSession(): Promise<
  | { ok: true; userId: string; doctorId: string }
  | { ok: false; response: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id || !isDoctor(session.user)) {
    return {
      ok: false,
      response: jsonMessage(401, "Doctor authentication required."),
    };
  }
  const doctorId =
    session.user.doctorId ?? (await resolveDoctorIdForUser(session.user.id));
  if (!doctorId) {
    return {
      ok: false,
      response: jsonMessage(404, "Doctor profile is not linked to this account."),
    };
  }
  return { ok: true, userId: session.user.id, doctorId };
}

export async function GET() {
  const authResult = await requireDoctorSession();
  if (!authResult.ok) return authResult.response;

  try {
    const data = await getDoctorAvailability(authResult.doctorId);
    return jsonData(data, "Doctor availability");
  } catch (error) {
    return jsonMessage(
      400,
      error instanceof Error ? error.message : "Could not load availability.",
    );
  }
}

export async function PUT(request: Request) {
  const authResult = await requireDoctorSession();
  if (!authResult.ok) return authResult.response;

  const payload = await readJson(request);
  if (!payload.ok) return payload.response;

  try {
    const body = doctorAvailabilityBodySchema.parse(payload.body);
    const data = await replaceDoctorAvailability(authResult.doctorId, body);
    return jsonData(data, "Doctor availability saved.");
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonMessage(400, zodMessage(error));
    }
    return jsonMessage(
      400,
      error instanceof Error ? error.message : "Could not save availability.",
    );
  }
}
