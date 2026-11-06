import { describe, expect, it } from "vitest";

import { getDashboardPath, resolvePostLoginPath } from "@/lib/auth/paths";

describe("staff login paths", () => {
  it("sends each role to its own dashboard", () => {
    expect(getDashboardPath("ADMIN")).toBe("/admin/dashboard");
    expect(getDashboardPath("DOCTOR")).toBe("/doctor/dashboard");
  });

  it("keeps a callback only inside the signed-in role", () => {
    expect(resolvePostLoginPath("ADMIN", "/admin/dashboard")).toBe("/admin/dashboard");
    expect(resolvePostLoginPath("DOCTOR", "/admin/dashboard")).toBe("/doctor/dashboard");
    expect(resolvePostLoginPath("ADMIN", "https://example.com")).toBe("/admin/dashboard");
    expect(
      resolvePostLoginPath(
        "ADMIN",
        "http://localhost:3000/admin/dashboard",
        "http://localhost:3000",
      ),
    ).toBe("/admin/dashboard");
    expect(
      resolvePostLoginPath(
        "DOCTOR",
        "http://localhost:3000/admin/dashboard",
        "http://localhost:3000",
      ),
    ).toBe("/doctor/dashboard");
  });
});
