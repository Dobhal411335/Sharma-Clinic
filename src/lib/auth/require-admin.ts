import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth/config";
import { hasRole } from "@/lib/auth/authorization";

type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

/**
 * Fail-closed ADMIN gate for sensitive payment operations (refunds).
 * Until Auth.js credentials/session wiring is complete, missing or
 * non-ADMIN sessions are rejected.
 */
export async function requireAdmin(): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse<ApiErrorBody> }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required.",
          },
        },
        { status: 401 },
      ),
    };
  }

  if (!hasRole(session, "ADMIN")) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Admin access required.",
          },
        },
        { status: 403 },
      ),
    };
  }

  return { ok: true, userId: session.user.id };
}
