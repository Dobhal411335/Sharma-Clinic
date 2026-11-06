import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

/**
 * Next.js 16 route protection uses `proxy.ts` (middleware renamed).
 * Optimistic redirects only — every API/page still re-checks via guards.
 */
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: ["/admin/:path*", "/doctor/:path*", "/login"],
};
