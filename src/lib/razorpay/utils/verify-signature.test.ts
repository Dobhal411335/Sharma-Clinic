import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  assertPaymentSignature,
  assertWebhookSignature,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "./verify-signature";
import { RazorpayIntegrationError } from "../types";

describe("payment signature", () => {
  const keySecret = "test_key_secret";

  it("9 invalid payment signature is rejected", () => {
    const ok = verifyPaymentSignature({
      orderId: "order_1",
      paymentId: "pay_1",
      signature: "deadbeef",
      keySecret,
    });
    expect(ok).toBe(false);
    expect(() =>
      assertPaymentSignature({
        orderId: "order_1",
        paymentId: "pay_1",
        signature: "deadbeef",
        keySecret,
      }),
    ).toThrow(RazorpayIntegrationError);
  });

  it("accepts a valid Checkout payment signature", () => {
    const orderId = "order_abc";
    const paymentId = "pay_xyz";
    const signature = createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(
      verifyPaymentSignature({ orderId, paymentId, signature, keySecret }),
    ).toBe(true);
  });
});

describe("webhook signature", () => {
  const webhookSecret = "whsec_test";

  it("10 invalid webhook signature is rejected", () => {
    const rawBody = JSON.stringify({ event: "payment.captured" });
    expect(
      verifyWebhookSignature({
        rawBody,
        signature: "nope",
        webhookSecret,
      }),
    ).toBe(false);

    expect(() =>
      assertWebhookSignature({
        rawBody,
        signature: "nope",
        webhookSecret,
      }),
    ).toThrow(RazorpayIntegrationError);
  });

  it("accepts HMAC of the raw body", () => {
    const rawBody = '{"event":"payment.captured"}';
    const signature = createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    expect(
      verifyWebhookSignature({ rawBody, signature, webhookSecret }),
    ).toBe(true);
  });
});
