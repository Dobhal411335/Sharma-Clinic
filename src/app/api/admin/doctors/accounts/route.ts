import { ZodError, z } from "zod";

import {
  createDoctorAccount,
  listDoctorAccounts,
} from "@/features/doctors/doctor-accounts.service";
import { jsonData, jsonMessage, readJson, requireCmsAdmin, zodMessage } from "@/features/cms/http";

const createSchema = z.object({
  name: z.string().trim().min(1, "Doctor name is required.").max(200),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(8, "Enter a valid phone number.").max(30),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
  passcode: z.string().trim().min(4, "Passcode must be at least 4 characters.").max(32),
  emailVerificationToken: z.string().trim().min(1, "Verify the doctor email first."),
});

export async function GET(request: Request) {
  const authResult = await requireCmsAdmin();
  if (!authResult.ok) return authResult.response;

  const status = new URL(request.url).searchParams.get("status") ?? "ALL";
  const allowed = new Set(["ALL", "PENDING_APPROVAL", "APPROVED", "DISABLED"]);
  if (!allowed.has(status)) {
    return jsonMessage(400, "Invalid status filter.");
  }

  const data = await listDoctorAccounts({
    status: status as "ALL" | "PENDING_APPROVAL" | "APPROVED" | "DISABLED",
  });
  return jsonData(data, "Doctor accounts");
}

export async function POST(request: Request) {
  const authResult = await requireCmsAdmin();
  if (!authResult.ok) return authResult.response;

  const payload = await readJson(request);
  if (!payload.ok) return payload.response;

  try {
    const body = createSchema.parse(payload.body);
    const created = await createDoctorAccount(body);
    return jsonData(created, "Doctor account created.", 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonMessage(400, zodMessage(error));
    }
    return jsonMessage(
      400,
      error instanceof Error ? error.message : "Could not create doctor account.",
    );
  }
}
