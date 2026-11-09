import { sendDoctorCredentialsEmail } from "@/features/doctors/doctor-accounts.service";
import { jsonData, jsonMessage, requireCmsAdmin } from "@/features/cms/http";
import {
  BrevoNotConfiguredError,
  BrevoSendError,
} from "@/server/integrations/brevo/send";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const authResult = await requireCmsAdmin();
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;
  try {
    const data = await sendDoctorCredentialsEmail(id);
    return jsonData(data, "Credentials email sent.");
  } catch (error) {
    if (error instanceof BrevoNotConfiguredError || error instanceof BrevoSendError) {
      return jsonMessage(503, error.message);
    }
    return jsonMessage(
      400,
      error instanceof Error ? error.message : "Could not send credentials email.",
    );
  }
}
