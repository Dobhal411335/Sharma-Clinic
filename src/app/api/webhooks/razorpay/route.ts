import { withRequestLogging } from "@/lib/logger";
import { processWebhook, verifyWebhookRequest } from "@/lib/razorpay";
import {
  handleRazorpayRouteError,
  jsonError,
  jsonSuccess,
} from "@/lib/razorpay/utils/http";

/**
 * POST /api/webhooks/razorpay
 * Verifies HMAC SHA256 against the RAW body before parse.
 * Uses x-razorpay-event-id unique inbox for idempotency.
 */
async function postHandler(request: Request): Promise<Response> {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const eventId = request.headers.get("x-razorpay-event-id");

    const payload = verifyWebhookRequest({
      rawBody,
      signatureHeader: signature,
    });

    if (!eventId?.trim()) {
      return jsonError(
        400,
        "WEBHOOK_EVENT_ID_MISSING",
        "Missing x-razorpay-event-id header.",
      );
    }

    const result = await processWebhook({
      eventId,
      payload,
    });

    // Always 200 for duplicates/processed so Razorpay does not retry forever
    // after we have durably recorded the event. Failed processing still 200
    // with status in body — retry storms are avoided once the inbox row exists.
    return jsonSuccess(result);
  } catch (error) {
    return handleRazorpayRouteError(error);
  }
}

export const POST = withRequestLogging(postHandler, {
  api: "webhooks.razorpay",
});
