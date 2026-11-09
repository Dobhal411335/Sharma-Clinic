import { ZodError, z } from "zod";

import { confirmDoctorCreateEmailOtp } from "@/features/doctors/doctor-email-verification.service";
import { jsonData, jsonMessage, readJson, requireCmsAdmin, zodMessage } from "@/features/cms/http";

const bodySchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit verification code."),
});

export async function POST(request: Request) {
  const authResult = await requireCmsAdmin();
  if (!authResult.ok) return authResult.response;

  const payload = await readJson(request);
  if (!payload.ok) return payload.response;

  try {
    const body = bodySchema.parse(payload.body);
    const result = await confirmDoctorCreateEmailOtp(body.email, body.otp);
    return jsonData(result, "Email verified.");
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonMessage(400, zodMessage(error));
    }
    return jsonMessage(
      400,
      error instanceof Error ? error.message : "Could not verify email.",
    );
  }
}
