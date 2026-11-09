import { ZodError, z } from "zod";

import {
  disableDoctorAccount,
  getDoctorAccount,
  updateDoctorAccount,
} from "@/features/doctors/doctor-accounts.service";
import { jsonData, jsonMessage, readJson, requireCmsAdmin, zodMessage } from "@/features/cms/http";

type RouteContext = { params: Promise<{ id: string }> };

const profileSchema = z.object({
  prefix: z.string().trim().max(40).optional(),
  name: z.string().trim().min(1).max(200),
  specializations: z.array(z.string().trim().min(1).max(120)).min(1).max(20),
  about: z.string().trim().min(1).max(20_000),
  experienceYears: z.coerce.number().int().min(0).max(80),
  state: z.string().trim().max(120).default(""),
  city: z.string().trim().max(120).default(""),
  phone: z.string().trim().max(30).default(""),
  email: z.string().trim().max(320).default(""),
  location: z.string().trim().max(500).default(""),
  education: z.string().max(10_000).default(""),
  degree: z.string().max(10_000).default(""),
  workHistory: z.string().max(20_000).default(""),
  workDays: z.string().max(2000).default(""),
  photoUrl: z.string().trim().min(1).max(2000),
  photoPublicId: z.string().trim().max(500).default(""),
  active: z.boolean(),
  order: z.coerce.number().int().min(0).max(10_000).optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  phone: z.string().trim().max(30).optional(),
  password: z.string().min(8).max(200).optional().or(z.literal("")),
  passcode: z.string().trim().min(4).max(32).optional(),
  profile: profileSchema.optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireCmsAdmin();
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;
  try {
    const data = await getDoctorAccount(id);
    return jsonData(data, "Doctor account");
  } catch (error) {
    return jsonMessage(
      404,
      error instanceof Error ? error.message : "Doctor account not found.",
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireCmsAdmin();
  if (!authResult.ok) return authResult.response;

  const payload = await readJson(request);
  if (!payload.ok) return payload.response;
  const { id } = await context.params;

  try {
    const body = updateSchema.parse(payload.body);
    const password = body.password?.trim() ? body.password : undefined;
    const data = await updateDoctorAccount(id, {
      name: body.name,
      phone: body.phone,
      password,
      passcode: body.passcode,
      profile: body.profile,
    });
    return jsonData(data, "Doctor account updated.");
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonMessage(400, zodMessage(error));
    }
    return jsonMessage(
      400,
      error instanceof Error ? error.message : "Could not update doctor account.",
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireCmsAdmin();
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;
  try {
    const data = await disableDoctorAccount(id);
    return jsonData(data, "Doctor account disabled.");
  } catch (error) {
    return jsonMessage(
      400,
      error instanceof Error ? error.message : "Could not disable doctor account.",
    );
  }
}
