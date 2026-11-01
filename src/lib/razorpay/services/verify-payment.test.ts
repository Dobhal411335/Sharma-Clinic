import { beforeEach, describe, expect, it, vi } from "vitest";

import { makePayment, signPayment } from "../__tests__/helpers";

const KEY_SECRET = "test_secret";

const { dbMock, fetchMock, markPaidMock } = vi.hoisted(() => ({
  dbMock: {
    payment: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
  fetchMock: vi.fn(),
  markPaidMock: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({ db: dbMock }));
vi.mock("../config", () => ({
  getRazorpayConfig: () => ({
    keyId: "rzp_test",
    keySecret: KEY_SECRET,
    webhookSecret: "whsec",
    publicKeyId: "rzp_test",
  }),
}));
vi.mock("./fetch-payment", () => ({
  fetchPayment: (...args: unknown[]) => fetchMock(...args),
}));
vi.mock("./mark-paid", () => ({
  markPaymentPaid: (...args: unknown[]) => markPaidMock(...args),
}));

import { verifyPayment } from "./verify-payment";

describe("verifyPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1 successful payment verify marks PAID", async () => {
    const payment = makePayment();
    dbMock.payment.findFirst.mockResolvedValue(payment);
    fetchMock.mockResolvedValue({
      providerPaymentId: "pay_rzp_1",
      providerOrderId: "order_1",
      amountPaise: 50_000,
      currency: "INR",
      status: "captured",
      captured: true,
      amountRefundedPaise: 0,
    });
    markPaidMock.mockResolvedValue({
      payment: { ...payment, status: "PAID", providerPaymentId: "pay_rzp_1" },
      alreadyPaid: false,
      newlyPaid: true,
    });

    const signature = signPayment("order_1", "pay_rzp_1", KEY_SECRET);
    const result = await verifyPayment({
      razorpay_order_id: "order_1",
      razorpay_payment_id: "pay_rzp_1",
      razorpay_signature: signature,
    });

    expect(result.status).toBe("PAID");
    expect(result.alreadyVerified).toBe(false);
    expect(markPaidMock).toHaveBeenCalled();
  });

  it("7 duplicate verify is idempotent", async () => {
    const payment = makePayment({
      status: "PAID",
      providerPaymentId: "pay_rzp_1",
      paidAt: new Date(),
    });
    dbMock.payment.findFirst.mockResolvedValue(payment);

    const signature = signPayment("order_1", "pay_rzp_1", KEY_SECRET);
    const result = await verifyPayment({
      razorpay_order_id: "order_1",
      razorpay_payment_id: "pay_rzp_1",
      razorpay_signature: signature,
    });

    expect(result.alreadyVerified).toBe(true);
    expect(markPaidMock).not.toHaveBeenCalled();
  });

  it("9 invalid payment signature throws", async () => {
    await expect(
      verifyPayment({
        razorpay_order_id: "order_1",
        razorpay_payment_id: "pay_rzp_1",
        razorpay_signature: "invalid",
      }),
    ).rejects.toMatchObject({ code: "INVALID_PAYMENT_SIGNATURE" });
  });

  it("19 amount mismatch is rejected", async () => {
    dbMock.payment.findFirst.mockResolvedValue(makePayment({ amountPaise: 50_000 }));
    fetchMock.mockResolvedValue({
      providerPaymentId: "pay_rzp_1",
      providerOrderId: "order_1",
      amountPaise: 10_000,
      currency: "INR",
      status: "captured",
      captured: true,
      amountRefundedPaise: 0,
    });

    const signature = signPayment("order_1", "pay_rzp_1", KEY_SECRET);
    await expect(
      verifyPayment({
        razorpay_order_id: "order_1",
        razorpay_payment_id: "pay_rzp_1",
        razorpay_signature: signature,
      }),
    ).rejects.toMatchObject({ code: "AMOUNT_MISMATCH" });
  });

  it("2 failed provider payment is rejected", async () => {
    dbMock.payment.findFirst.mockResolvedValue(makePayment());
    fetchMock.mockResolvedValue({
      providerPaymentId: "pay_rzp_fail",
      providerOrderId: "order_1",
      amountPaise: 50_000,
      currency: "INR",
      status: "failed",
      captured: false,
      amountRefundedPaise: 0,
    });

    const signature = signPayment("order_1", "pay_rzp_fail", KEY_SECRET);
    await expect(
      verifyPayment({
        razorpay_order_id: "order_1",
        razorpay_payment_id: "pay_rzp_fail",
        razorpay_signature: signature,
      }),
    ).rejects.toMatchObject({ code: "PAYMENT_FAILED_AT_PROVIDER" });
  });
});
