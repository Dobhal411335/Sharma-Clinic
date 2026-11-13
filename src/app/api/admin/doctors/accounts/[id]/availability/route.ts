import { ZodError } from "zod";

import {
  getDoctorAvailability,
  replaceDoctorAvailability,
} from "@/features/doctors/doctor-availability.service";
import { getDoctorAccount } from "@/features/doctors/doctor-accounts.service";
import {
  jsonData,
  jsonMessage,
  readJson,
  requireCmsAdmin,
  zodMessage,
} from "@/features/cms/http";
import { doctorAvailabilityBodySchema } from "@/lib/doctor-availability-schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireCmsAdmin();
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;
  try {
    const account = await getDoctorAccount(id);
    if (!account.doctorId) {
      return jsonMessage(404, "Doctor operational profile not found.");
    }
    const data = await getDoctorAvailability(account.doctorId);
    return jsonData(data, "Doctor availability");
  } catch (error) {
    return jsonMessage(
      404,
      error instanceof Error ? error.message : "Doctor availability not found.",
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const authResult = await requireCmsAdmin();
  if (!authResult.ok) return authResult.response;

  const payload = await readJson(request);
  if (!payload.ok) return payload.response;
  const { id } = await context.params;

  try {
    const account = await getDoctorAccount(id);
    if (!account.doctorId) {
      return jsonMessage(404, "Doctor operational profile not found.");
    }
    const body = doctorAvailabilityBodySchema.parse(payload.body);
    const data = await replaceDoctorAvailability(account.doctorId, body);
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
