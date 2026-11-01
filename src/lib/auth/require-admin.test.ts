import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession } = vi.hoisted(() => ({
  getServerSession: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSession(...args),
}));

vi.mock("@/lib/auth/config", () => ({
  authOptions: {},
}));

import { requireAdmin } from "./require-admin";

describe("requireAdmin (fail-closed)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("18 unauthorized refund path rejects missing session", async () => {
    getServerSession.mockResolvedValue(null);
    const result = await requireAdmin();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
  });

  it("18 unauthorized refund path rejects non-admin", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "u1", role: "DOCTOR" },
    });
    const result = await requireAdmin();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
    }
  });

  it("allows ADMIN", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "admin_1", role: "ADMIN" },
    });
    const result = await requireAdmin();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.userId).toBe("admin_1");
    }
  });
});
