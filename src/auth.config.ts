import type { NextAuthConfig } from "next-auth";

import { getDashboardPath } from "@/lib/auth/paths";
import type { StaffRole } from "@/lib/auth/types";

function staffRole(value: unknown): StaffRole | undefined {
  return value === "ADMIN" || value === "DOCTOR" ? value : undefined;
}

/**
 * Edge-safe Auth.js config. Credential checks stay in `src/auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.doctorId = user.doctorId;
      }
      return token;
    },
    session({ session, token }) {
      const role = staffRole(token.role);
      if (session.user && role) {
        session.user.id = token.sub ?? "";
        session.user.role = role;
        session.user.doctorId = typeof token.doctorId === "string" ? token.doctorId : null;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role;
      const signedIn = Boolean(auth?.user?.id && (role === "ADMIN" || role === "DOCTOR"));

      if (pathname.startsWith("/admin")) {
        if (!signedIn) return false;
        if (role !== "ADMIN") {
          return Response.redirect(new URL(getDashboardPath(role), request.nextUrl));
        }
        return true;
      }

      if (pathname.startsWith("/doctor")) {
        if (!signedIn) return false;
        if (role !== "DOCTOR") {
          return Response.redirect(new URL(getDashboardPath(role), request.nextUrl));
        }
        return true;
      }

      if (pathname === "/login" && signedIn) {
        return Response.redirect(new URL(getDashboardPath(role), request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
