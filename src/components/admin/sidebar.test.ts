import { describe, expect, it } from "vitest";

import { adminNav, findAdminNavItem, findAdminTrail, listAdminDestinations } from "./sidebar";

describe("admin sidebar", () => {
  it("gives every destination a unique /admin path", () => {
    const hrefs = listAdminDestinations(adminNav).map((item) => item.href);
    expect(hrefs.every((href) => href?.startsWith("/admin/"))).toBe(true);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("exposes Booking Order as a top-level destination", () => {
    expect(findAdminNavItem("/admin/bookings")?.title).toBe("Booking Order");
    expect(findAdminTrail("/admin/bookings")?.map((item) => item.title)).toEqual([
      "Booking Order",
    ]);
  });

  it("no longer lists the old appointment report tree", () => {
    const hrefs = listAdminDestinations(adminNav).map((item) => item.href);
    expect(hrefs).not.toContain("/admin/reports/gateway/success");
    expect(hrefs).not.toContain("/admin/reports/revenue");
    expect(hrefs).not.toContain("/admin/reports/day/confirm");
  });

  it("returns null for an unknown admin path", () => {
    expect(findAdminNavItem("/admin/not-a-page")).toBeNull();
  });
});
