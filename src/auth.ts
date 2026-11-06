import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { verifyPassword } from "@/lib/auth/password";
import { clearLoginFailures, isLoginLocked, recordLoginFailure } from "@/lib/auth/rate-limit";
import type { StaffRole } from "@/lib/auth/types";
import { prisma } from "@/lib/db/prisma";

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readRole(value: unknown): StaffRole | null {
  return value === "ADMIN" || value === "DOCTOR" ? value : null;
}

function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials, request) {
        const email = readString(credentials?.email).toLowerCase();
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const role = readRole(credentials?.role);
        if (!email || !password || !role) return null;

        const emailKey = `login:email:${email}`;
        const ipKey = `login:ip:${clientAddress(request)}`;

        try {
          if ((await isLoginLocked(emailKey)) || (await isLoginLocked(ipKey))) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              passwordHash: true,
              role: true,
              isActive: true,
              doctor: { select: { id: true } },
            },
          });

          const passwordOk = user
            ? await verifyPassword(password, user.passwordHash)
            : false;

          if (!user || !user.isActive || user.role !== role || !passwordOk) {
            await recordLoginFailure(emailKey);
            await recordLoginFailure(ipKey);
            return null;
          }

          await clearLoginFailures(emailKey);
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            doctorId: user.doctor?.id ?? null,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.doctorId = user.doctorId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        if (token.role === "ADMIN" || token.role === "DOCTOR") {
          session.user.role = token.role;
        }
        session.user.doctorId = typeof token.doctorId === "string" ? token.doctorId : null;
      }
      return session;
    },
  },
});
