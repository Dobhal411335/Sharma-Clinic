import { ZodError, z } from "zod";

import { approveDoctorAccount } from "@/features/doctors/doctor-accounts.service";
import { jsonData, jsonMessage, readJson, requireCmsAdmin, zodMessage } from "@/features/cms/http";

type RouteContext = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  password: z.string().min(8).max(200).optional(),
  passcode: z.string().trim().min(4).max(32).optional(),
});

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireCmsAdmin();
  if (!authResult.ok) return authResult.response;

  const payload = await readJson(request);
  if (!payload.ok) return payload.response;
  const { id } = await context.params;

  try {
    const body = bodySchema.parse(payload.body ?? {});
    const data = await approveDoctorAccount(id, body);
    return jsonData(data, "Doctor approved.");
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonMessage(400, zodMessage(error));
    }
    return jsonMessage(
      400,
      error instanceof Error ? error.message : "Could not approve doctor.",
    );
  }
}
