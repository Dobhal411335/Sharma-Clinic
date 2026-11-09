import { ZodError, z } from "zod";

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
import { WEEKDAY_VALUES } from "@/types/doctors-availability";

type RouteContext = { params: Promise<{ id: string }> };

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
    const body = bodySchema.parse(payload.body);
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
