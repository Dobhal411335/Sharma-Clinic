import { beforeEach, describe, expect, it, vi } from "vitest";

import { makePayment } from "../__tests__/helpers";

const { dbMock, notifyMock } = vi.hoisted(() => ({
  dbMock: {
    $transaction: vi.fn(),
  },
  notifyMock: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({ db: dbMock }));
vi.mock("./notifications", () => ({
  notifyPaymentSucceeded: (...args: unknown[]) => notifyMock(...args),
}));

import { markPaymentPaid } from "./mark-paid";

describe("markPaymentPaid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("14 two successful attempts are flagged for reconciliation", async () => {
    const firstPaid = makePayment({
      id: "pay_1",
      status: "ORDER_CREATED",
      providerPaymentId: null,
    });
    const otherPaid = makePayment({
      id: "pay_0",
      attemptNumber: 0,
      status: "PAID",
      providerPaymentId: "pay_rzp_old",
      activeAppointmentId: null,
    });
    const appointmentUpdate = vi.fn().mockResolvedValue({});

    dbMock.$transaction.mockImplementation(async (fn: (tx: unknown) => unknown) => {
      const tx = {
        payment: {
          findUnique: vi.fn().mockResolvedValue(firstPaid),
          findFirst: vi.fn().mockResolvedValue(otherPaid),
          update: vi.fn().mockResolvedValue({
            ...firstPaid,
            status: "PAID",
            providerPaymentId: "pay_rzp_new",
            needsReconciliation: true,
            paidAt: new Date(),
            activeAppointmentId: null,
          }),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        appointment: {
          update: appointmentUpdate,
        },
      };
      return fn(tx);
    });

    const result = await markPaymentPaid({
      paymentId: "pay_1",
      providerPaymentId: "pay_rzp_new",
      providerOrderId: "order_1",
      source: "verify",
    });

    expect(result.newlyPaid).toBe(true);
    expect(result.payment.needsReconciliation).toBe(true);
    expect(appointmentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "PENDING" },
      }),
    );
    expect(notifyMock).toHaveBeenCalled();
  });

  it("sets appointment to PENDING (awaiting admin) on first successful pay", async () => {
    const payment = makePayment({
      id: "pay_2",
      status: "ORDER_CREATED",
      providerPaymentId: null,
    });
    const appointmentUpdate = vi.fn().mockResolvedValue({});

    dbMock.$transaction.mockImplementation(async (fn: (tx: unknown) => unknown) => {
      const tx = {
        payment: {
          findUnique: vi.fn().mockResolvedValue(payment),
          findFirst: vi.fn().mockResolvedValue(null),
          update: vi.fn().mockResolvedValue({
            ...payment,
            status: "PAID",
            providerPaymentId: "pay_rzp_2",
            paidAt: new Date(),
            activeAppointmentId: null,
          }),
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
        appointment: {
          update: appointmentUpdate,
        },
      };
      return fn(tx);
    });

    await markPaymentPaid({
      paymentId: "pay_2",
      providerPaymentId: "pay_rzp_2",
      source: "verify",
    });

    expect(appointmentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: payment.appointmentId },
        data: { status: "PENDING" },
      }),
    );
  });

  it("7 idempotent when already PAID", async () => {
    const paid = makePayment({
      status: "PAID",
      providerPaymentId: "pay_rzp_1",
      paidAt: new Date(),
      activeAppointmentId: null,
    });

    dbMock.$transaction.mockImplementation(async (fn: (tx: unknown) => unknown) => {
      const tx = {
        payment: {
          findUnique: vi.fn().mockResolvedValue(paid),
          updateMany: vi.fn(),
        },
      };
      return fn(tx);
    });

    const result = await markPaymentPaid({
      paymentId: paid.id,
      providerPaymentId: "pay_rzp_1",
      source: "webhook",
    });

    expect(result.alreadyPaid).toBe(true);
    expect(result.newlyPaid).toBe(false);
    expect(notifyMock).not.toHaveBeenCalled();
  });
});
