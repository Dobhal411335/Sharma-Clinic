import { describe, expect, it } from "vitest";

import { addIsoDays, clinicDayStartUtc, defaultDashboardRange, parseDashboardRange } from "./dashboard-range";

describe("dashboard date range", () => {
  it("starts a clinic day at 18:30 UTC the previous evening", () => {
    expect(clinicDayStartUtc("2026-11-06").toISOString()).toBe("2026-11-05T18:30:00.000Z");
  });

  it("defaults to the last 30 clinic days, including today", () => {
    const now = new Date("2026-11-06T10:00:00.000Z");
    expect(defaultDashboardRange(now)).toEqual({ from: "2026-10-08", to: "2026-11-06" });
    expect(addIsoDays("2026-11-06", -29)).toBe("2026-10-08");
  });

  it("swaps an inverted range and rejects an invalid day", () => {
    const now = new Date("2026-11-06T10:00:00.000Z");
    const swapped = parseDashboardRange({ from: "2026-11-06", to: "2026-11-01" }, now);
    expect(swapped.from).toBe("2026-11-01");
    expect(swapped.to).toBe("2026-11-06");
    expect(swapped.toUtcExclusive.toISOString()).toBe("2026-11-06T18:30:00.000Z");

    const invalid = parseDashboardRange({ from: "2026-02-31", to: "nope" }, now);
    expect(invalid.from).toBe("2026-10-08");
    expect(invalid.to).toBe("2026-11-06");
  });
});
