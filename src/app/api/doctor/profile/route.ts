import { ZodError, z } from "zod";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getDoctorAccount,
  updateDoctorAccount,
} from "@/features/doctors/doctor-accounts.service";
import { resolveDoctorIdForUser } from "@/features/doctors/doctor-availability.service";
import { jsonData, jsonMessage, readJson, zodMessage } from "@/features/cms/http";
import { isDoctor } from "@/lib/auth/permissions";

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
  profile: profileSchema.optional(),
});

async function requireDoctorUser(): Promise<
  | { ok: true; userId: string }
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
  return { ok: true, userId: session.user.id };
}

export async function GET() {
  const authResult = await requireDoctorUser();
  if (!authResult.ok) return authResult.response;

  try {
    const data = await getDoctorAccount(authResult.userId);
    return jsonData(
      {
        ...data,
        passwordPrefill: null,
        canShowPendingPassword: false,
        pendingPassword: null,
      },
      "Doctor profile",
    );
  } catch (error) {
    return jsonMessage(
      404,
      error instanceof Error ? error.message : "Doctor profile not found.",
    );
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireDoctorUser();
  if (!authResult.ok) return authResult.response;

  const payload = await readJson(request);
  if (!payload.ok) return payload.response;

  try {
    const body = updateSchema.parse(payload.body);
    const data = await updateDoctorAccount(authResult.userId, {
      name: body.name,
      phone: body.phone,
      profile: body.profile,
    });
    return jsonData(
      {
        ...data,
        passwordPrefill: null,
        canShowPendingPassword: false,
        pendingPassword: null,
      },
      "Doctor profile updated.",
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonMessage(400, zodMessage(error));
    }
    return jsonMessage(
      400,
      error instanceof Error ? error.message : "Could not update profile.",
    );
  }
}
