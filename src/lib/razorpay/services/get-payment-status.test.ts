import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeAppointment, makePayment } from "../__tests__/helpers";

const { dbMock } = vi.hoisted(() => ({
  dbMock: {
    appointment: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db/prisma", () => ({ db: dbMock }));

import { getPaymentStatusForAppointment } from "./get-payment-status";

describe("getPaymentStatusForAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns limited non-sensitive fields", async () => {
    dbMock.appointment.findUnique.mockResolvedValue({
      ...makeAppointment(),
      payments: [makePayment({ status: "ORDER_CREATED" })],
    });

    const result = await getPaymentStatusForAppointment("appt_1");
    expect(result.appointmentId).toBe("appt_1");
    expect(result.paymentStatus).toBe("ORDER_CREATED");
    expect(result).not.toHaveProperty("patientEmail");
    expect(result).not.toHaveProperty("patientName");
  });

  it("20 doctor accessing another doctor's payment is denied", async () => {
    dbMock.appointment.findUnique.mockResolvedValue({
      ...makeAppointment({ doctorId: "doc_1" }),
      payments: [makePayment()],
    });

    await expect(
      getPaymentStatusForAppointment("appt_1", { doctorId: "doc_other" }),
    ).rejects.toMatchObject({ code: "DOCTOR_SCOPE_DENIED" });
  });

  it("rejects bad access token", async () => {
    dbMock.appointment.findUnique.mockResolvedValue({
      ...makeAppointment({ accessToken: "correct" }),
      payments: [],
    });

    await expect(
      getPaymentStatusForAppointment("appt_1", { accessToken: "wrong" }),
    ).rejects.toMatchObject({ code: "APPOINTMENT_ACCESS_DENIED" });
  });
});
