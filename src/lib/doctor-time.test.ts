import { describe, expect, it } from "vitest";

import {
  formatTimeAmPm,
  formatTimeRangeAmPm,
  windowCapacityPatients,
} from "@/lib/doctor-time";

describe("doctor-time helpers", () => {
  it("formats 24h times as AM/PM", () => {
    expect(formatTimeAmPm("09:30")).toBe("9:30 AM");
    expect(formatTimeAmPm("13:00")).toBe("1:00 PM");
    expect(formatTimeAmPm("00:15")).toBe("12:15 AM");
    expect(formatTimeAmPm("12:00")).toBe("12:00 PM");
  });

  it("formats ranges", () => {
    expect(formatTimeRangeAmPm("11:00", "13:00")).toBe("11:00 AM – 1:00 PM");
  });

  it("computes patient capacity from window and slot length", () => {
    expect(windowCapacityPatients("11:00", "13:00", 10)).toBe(12);
    expect(windowCapacityPatients("17:00", "20:00", 10)).toBe(18);
    expect(windowCapacityPatients("09:00", "10:00", 15)).toBe(4);
  });
});
