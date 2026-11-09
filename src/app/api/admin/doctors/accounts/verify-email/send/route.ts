import { ZodError, z } from "zod";

import { sendDoctorCreateEmailOtp } from "@/features/doctors/doctor-email-verification.service";
import { jsonData, jsonMessage, readJson, requireCmsAdmin, zodMessage } from "@/features/cms/http";
import {
  BrevoNotConfiguredError,
  BrevoSendError,
} from "@/server/integrations/brevo/send";

const bodySchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export async function POST(request: Request) {
  const authResult = await requireCmsAdmin();
  if (!authResult.ok) return authResult.response;

  const payload = await readJson(request);
  if (!payload.ok) return payload.response;

  try {
    const body = bodySchema.parse(payload.body);
    const result = await sendDoctorCreateEmailOtp(body.email);
    return jsonData(result, "Verification code sent.");
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonMessage(400, zodMessage(error));
    }
    if (error instanceof BrevoNotConfiguredError || error instanceof BrevoSendError) {
      return jsonMessage(503, error.message);
    }
    return jsonMessage(
      400,
      error instanceof Error ? error.message : "Could not send verification code.",
    );
  }
}
