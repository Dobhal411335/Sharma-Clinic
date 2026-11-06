import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/permissions";

export async function requireAdmin(): Promise<
  | { ok: true; user: { id: string; role: "ADMIN" } }
  | { ok: false; response: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 },
      ),
    };
  }

  if (!isAdmin(session.user)) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required." } },
        { status: 403 },
      ),
    };
  }

  return { ok: true, user: { id: session.user.id, role: "ADMIN" } };
}
