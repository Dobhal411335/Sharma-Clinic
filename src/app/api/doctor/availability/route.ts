import { ZodError, z } from "zod";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getDoctorAvailability,
  replaceDoctorAvailability,
  resolveDoctorIdForUser,
} from "@/features/doctors/doctor-availability.service";
import { jsonData, jsonMessage, readJson, zodMessage } from "@/features/cms/http";
import { isDoctor } from "@/lib/auth/permissions";
import { WEEKDAY_VALUES } from "@/types/doctors-availability";

const windowSchema = z.object({
  weekday: z.enum(WEEKDAY_VALUES),
  startTimeLocal: z.string().trim(),
  endTimeLocal: z.string().trim(),
  slotDurationMinutes: z.coerce.number().int().min(5).max(240),
});

const bodySchema = z.object({
  windows: z.array(windowSchema).min(1),
  applyMode: z.enum(["WEEK", "MONTH"]),
  applyWeekdays: z.array(z.enum(WEEKDAY_VALUES)).optional(),
});

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
    const body = bodySchema.parse(payload.body);
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
