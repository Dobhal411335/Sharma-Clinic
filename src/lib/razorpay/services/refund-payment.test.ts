import { beforeEach, describe, expect, it, vi } from "vitest";

import { makePayment, makeRefund } from "../__tests__/helpers";

const { dbMock } = vi.hoisted(() => ({
  dbMock: {
    payment: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    refund: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db/prisma", () => ({ db: dbMock }));
vi.mock("../config", () => ({
  getRazorpayConfig: () => ({
    keyId: "rzp_test",
    keySecret: "secret",
    webhookSecret: "whsec",
    publicKeyId: "rzp_test",
  }),
}));

import { refundPayment } from "./refund-payment";

describe("refundPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "rfnd_1",
          payment_id: "pay_rzp_1",
          amount: 50_000,
          currency: "INR",
          status: "processed",
        }),
      }),
    );
  });

  it("15 full refund when amount omitted", async () => {
    const payment = makePayment({
      status: "PAID",
      providerPaymentId: "pay_rzp_1",
      paidAt: new Date(),
    });
    dbMock.payment.findUnique.mockResolvedValue({ ...payment, refunds: [] });
    dbMock.refund.findUnique.mockResolvedValue(null);
    dbMock.refund.create.mockResolvedValue(
      makeRefund({ id: "refund_full", amountPaise: 50_000, status: "PENDING" }),
    );
    dbMock.refund.update.mockResolvedValue(
      makeRefund({
        id: "refund_full",
        amountPaise: 50_000,
        status: "PROCESSED",
        providerRefundId: "rfnd_1",
      }),
    );
    dbMock.refund.findMany.mockResolvedValue([
      makeRefund({
        id: "refund_full",
        amountPaise: 50_000,
        status: "PROCESSED",
        providerRefundId: "rfnd_1",
      }),
    ]);
    dbMock.payment.update.mockResolvedValue({
      ...payment,
      status: "REFUNDED",
    });

    const result = await refundPayment({ paymentId: payment.id });
    expect(result.amountPaise).toBe(50_000);
    expect(result.paymentStatus).toBe("REFUNDED");
    expect(result.idempotentReplay).toBe(false);
  });

  it("16 partial refund does not over-refund", async () => {
    const payment = makePayment({
      status: "PAID",
      providerPaymentId: "pay_rzp_1",
      amountPaise: 50_000,
      paidAt: new Date(),
    });
    dbMock.payment.findUnique.mockResolvedValue({ ...payment, refunds: [] });
    dbMock.refund.findUnique.mockResolvedValue(null);
    dbMock.refund.create.mockResolvedValue(
      makeRefund({ id: "refund_part", amountPaise: 10_000, status: "PENDING" }),
    );
    dbMock.refund.update.mockResolvedValue(
      makeRefund({
        id: "refund_part",
        amountPaise: 10_000,
        status: "PROCESSED",
        providerRefundId: "rfnd_part",
      }),
    );
    dbMock.refund.findMany.mockResolvedValue([
      makeRefund({
        amountPaise: 10_000,
        status: "PROCESSED",
        providerRefundId: "rfnd_part",
      }),
    ]);

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        id: "rfnd_part",
        payment_id: "pay_rzp_1",
        amount: 10_000,
        currency: "INR",
        status: "processed",
      }),
    } as Response);

    const result = await refundPayment({
      paymentId: payment.id,
      amountPaise: 10_000,
    });
    expect(result.amountPaise).toBe(10_000);
    expect(result.paymentStatus).toBe("PAID");
    expect(dbMock.payment.update).not.toHaveBeenCalled();
  });

  it("17 duplicate refund with same idempotency key replays", async () => {
    const payment = makePayment({
      status: "PAID",
      providerPaymentId: "pay_rzp_1",
      paidAt: new Date(),
    });
    const existing = makeRefund({
      idempotencyKey: "custom_refund_key_1",
      status: "PROCESSED",
      providerRefundId: "rfnd_1",
      amountPaise: 50_000,
    });
    dbMock.payment.findUnique.mockResolvedValue({ ...payment, refunds: [existing] });
    dbMock.refund.findUnique.mockResolvedValue(existing);

    const result = await refundPayment({
      paymentId: payment.id,
      idempotencyKey: "custom_refund_key_1",
    });

    expect(result.idempotentReplay).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects refund exceeding remaining balance", async () => {
    const payment = makePayment({
      status: "PAID",
      providerPaymentId: "pay_rzp_1",
      amountPaise: 50_000,
      paidAt: new Date(),
    });
    dbMock.payment.findUnique.mockResolvedValue({
      ...payment,
      refunds: [
        makeRefund({ amountPaise: 40_000, status: "PROCESSED" }),
      ],
    });

    await expect(
      refundPayment({ paymentId: payment.id, amountPaise: 20_000 }),
    ).rejects.toMatchObject({ code: "REFUND_EXCEEDS_BALANCE" });
  });
});
