import { describe, expect, it } from "vitest";

import { adminNav, findAdminNavItem, findAdminTrail, listAdminDestinations } from "./sidebar";

describe("admin sidebar", () => {
  it("gives every destination a unique /admin path", () => {
    const hrefs = listAdminDestinations(adminNav).map((item) => item.href);
    expect(hrefs.every((href) => href?.startsWith("/admin/"))).toBe(true);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("finds a nested report and its breadcrumb", () => {
    expect(findAdminNavItem("/admin/reports/gateway/success")?.title).toBe("Success");
    expect(findAdminTrail("/admin/reports/day/next-day")?.map((item) => item.title)).toEqual([
      "Appointment Order Report",
      "Day Appointment Report",
      "Post For Next Day",
    ]);
  });

  it("returns null for an unknown admin path", () => {
    expect(findAdminNavItem("/admin/not-a-page")).toBeNull();
  });
});
