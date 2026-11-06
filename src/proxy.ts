import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

/**
 * Next.js 16 route protection. Layouts still re-check the role on the server.
 */
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: ["/admin/:path*", "/doctor/:path*", "/login"],
};
