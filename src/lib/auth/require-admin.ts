import { NextResponse } from "next/server";

import { requireAdmin as requireAdminGuard } from "@/lib/auth/guards";

/**
 * Thin adapter used by payment/admin API routes that expect `userId` at the top level.
 */
export async function requireAdmin(): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  const result = await requireAdminGuard();
  if (!result.ok) {
    return result;
  }
  return { ok: true, userId: result.user.id };
}
