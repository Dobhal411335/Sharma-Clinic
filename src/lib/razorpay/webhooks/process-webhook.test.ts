import { beforeEach, describe, expect, it, vi } from "vitest";

import { makePayment } from "../__tests__/helpers";
import type { RazorpayWebhookPayload } from "../types";

const { dbMock, markPaidMock, markFailedMock } = vi.hoisted(() => ({
  dbMock: {
    paymentWebhookEvent: {
      create: vi.fn(),
      update: vi.fn(),
    },
    payment: {
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    refund: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
  markPaidMock: vi.fn(),
  markFailedMock: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({ db: dbMock }));
vi.mock("../services/mark-paid", () => ({
  markPaymentPaid: (...args: unknown[]) => markPaidMock(...args),
  markPaymentFailed: (...args: unknown[]) => markFailedMock(...args),
}));

import { processWebhook } from "./process-webhook";

function capturedPayload(): RazorpayWebhookPayload {
  return {
    entity: "event",
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_rzp_1",
          order_id: "order_1",
          amount: 50_000,
          currency: "INR",
          status: "captured",
          captured: true,
        },
      },
    },
  };
}

describe("processWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.paymentWebhookEvent.create.mockResolvedValue({ id: "evt_row" });
    dbMock.paymentWebhookEvent.update.mockResolvedValue({});
  });

  it("1 successful payment.captured marks PAID", async () => {
    dbMock.payment.findFirst.mockResolvedValue(makePayment());
    markPaidMock.mockResolvedValue({
      payment: makePayment({ status: "PAID" }),
      alreadyPaid: false,
      newlyPaid: true,
    });

    const result = await processWebhook({
      eventId: "evt_1",
      payload: capturedPayload(),
    });

    expect(result.processingStatus).toBe("PROCESSED");
    expect(markPaidMock).toHaveBeenCalled();
  });

  it("8 duplicate webhook is ignored via unique event id", async () => {
    const conflict = {
      name: "PrismaClientKnownRequestError",
      code: "P2002",
      message: "Unique constraint failed",
      clientVersion: "7",
    };
    // processWebhook uses Prisma.PrismaClientKnownRequestError instanceof —
    // inject via prototype chain by importing Prisma and constructing, or
    // spy isUniqueViolation path by mocking create to throw a real Prisma error.
    const { Prisma } = await import("@prisma/client");
    const err = new Prisma.PrismaClientKnownRequestError("Unique", {
      code: "P2002",
      clientVersion: "7.0.0",
    });
    dbMock.paymentWebhookEvent.create.mockRejectedValue(err);

    const result = await processWebhook({
      eventId: "evt_dup",
      payload: capturedPayload(),
    });

    expect(result.processingStatus).toBe("DUPLICATE");
    expect(markPaidMock).not.toHaveBeenCalled();
    void conflict;
  });

  it("11 out-of-order payment.failed after PAID does not downgrade", async () => {
    dbMock.payment.findFirst.mockResolvedValue(
      makePayment({ status: "PAID", providerPaymentId: "pay_rzp_1" }),
    );

    const result = await processWebhook({
      eventId: "evt_fail_late",
      payload: {
        entity: "event",
        event: "payment.failed",
        payload: {
          payment: {
            entity: {
              id: "pay_rzp_1",
              order_id: "order_1",
              amount: 50_000,
              currency: "INR",
              status: "failed",
              captured: false,
              error_description: "late fail",
            },
          },
        },
      },
    });

    expect(result.processingStatus).toBe("PROCESSED");
    expect(markFailedMock).not.toHaveBeenCalled();
    expect(result.message).toMatch(/Ignored stale failure/i);
  });

  it("2 payment.failed marks FAILED when still active", async () => {
    dbMock.payment.findFirst.mockResolvedValue(
      makePayment({ status: "PENDING" }),
    );
    markFailedMock.mockResolvedValue(makePayment({ status: "FAILED" }));

    const result = await processWebhook({
      eventId: "evt_fail",
      payload: {
        entity: "event",
        event: "payment.failed",
        payload: {
          payment: {
            entity: {
              id: "pay_rzp_fail",
              order_id: "order_1",
              amount: 50_000,
              currency: "INR",
              status: "failed",
              captured: false,
            },
          },
        },
      },
    });

    expect(markFailedMock).toHaveBeenCalled();
    expect(result.processingStatus).toBe("PROCESSED");
  });
});
