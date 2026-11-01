import { describe, expect, it, vi } from "vitest";

import { signWebhook } from "../__tests__/helpers";

vi.mock("../config", () => ({
  getRazorpayConfig: () => ({
    keyId: "rzp_test",
    keySecret: "secret",
    webhookSecret: "whsec_test",
    publicKeyId: "rzp_test",
  }),
}));

import { verifyWebhookRequest } from "./verify-webhook";

describe("verifyWebhookRequest", () => {
  it("10 rejects invalid webhook signature before parse side effects", () => {
    expect(() =>
      verifyWebhookRequest({
        rawBody: '{"event":"payment.captured"}',
        signatureHeader: "bad",
      }),
    ).toThrowError(/Invalid webhook signature/i);
  });

  it("parses payload after valid signature", () => {
    const rawBody = JSON.stringify({
      entity: "event",
      event: "payment.captured",
      payload: {},
    });
    const signature = signWebhook(rawBody, "whsec_test");
    const payload = verifyWebhookRequest({
      rawBody,
      signatureHeader: signature,
    });
    expect(payload.event).toBe("payment.captured");
  });
});
