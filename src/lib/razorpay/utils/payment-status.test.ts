import { describe, expect, it } from "vitest";

import {
  activeLockValue,
  assertPaymentTransition,
  canTransitionPaymentStatus,
  resolvePaymentTransition,
} from "./payment-status";
import { RazorpayIntegrationError } from "../types";

describe("payment status state machine", () => {
  it("allows CREATED → ORDER_CREATED → PENDING → PAID", () => {
    expect(canTransitionPaymentStatus("CREATED", "ORDER_CREATED")).toBe(true);
    expect(canTransitionPaymentStatus("ORDER_CREATED", "PENDING")).toBe(true);
    expect(canTransitionPaymentStatus("PENDING", "PAID")).toBe(true);
  });

  it("11 out-of-order: never reverts PAID → FAILED", () => {
    expect(canTransitionPaymentStatus("PAID", "FAILED")).toBe(false);
    const resolved = resolvePaymentTransition("PAID", "FAILED");
    expect(resolved.apply).toBe(false);
    expect(resolved.ignoreStale).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(() => assertPaymentTransition("FAILED", "PAID")).toThrow(
      RazorpayIntegrationError,
    );
    expect(canTransitionPaymentStatus("REFUNDED", "PAID")).toBe(false);
  });

  it("active lock is set only for active statuses", () => {
    expect(activeLockValue("appt_1", "ORDER_CREATED")).toBe("appt_1");
    expect(activeLockValue("appt_1", "PAID")).toBeNull();
    expect(activeLockValue("appt_1", "FAILED")).toBeNull();
  });

  it("6 timeout after order create can move to EXPIRED", () => {
    expect(canTransitionPaymentStatus("ORDER_CREATED", "EXPIRED")).toBe(true);
    expect(canTransitionPaymentStatus("PENDING", "EXPIRED")).toBe(true);
  });

  it("13 failed then retry: FAILED is terminal for that attempt", () => {
    expect(canTransitionPaymentStatus("FAILED", "ORDER_CREATED")).toBe(false);
    expect(canTransitionPaymentStatus("FAILED", "PAID")).toBe(false);
  });
});
