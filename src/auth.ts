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
        passcode: { label: "Passcode", type: "text" },
        loginMethod: { label: "Login method", type: "text" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials, request) {
        const role = readRole(credentials?.role);
        if (!role) return null;

        const loginMethod = readString(credentials?.loginMethod) || "password";
        const ipKey = `login:ip:${clientAddress(request)}`;

        try {
          if (await isLoginLocked(ipKey)) {
            return null;
          }

          if (loginMethod === "passcode") {
            if (role !== "DOCTOR") return null;
            const passcode = readString(credentials?.passcode);
            if (!passcode) return null;

            const passcodeKey = `login:passcode:${passcode}`;
            if (await isLoginLocked(passcodeKey)) {
              return null;
            }

            const user = await prisma.user.findUnique({
              where: { passcode },
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                approvalStatus: true,
                doctor: { select: { id: true } },
              },
            });

            const ok =
              Boolean(user) &&
              user!.isActive &&
              user!.approvalStatus === "APPROVED" &&
              user!.role === "DOCTOR";

            if (!ok) {
              await recordLoginFailure(passcodeKey);
              await recordLoginFailure(ipKey);
              return null;
            }

            await clearLoginFailures(passcodeKey);
            await clearLoginFailures(ipKey);
            await prisma.user.update({
              where: { id: user!.id },
              data: { lastLoginAt: new Date() },
            });

            return {
              id: user!.id,
              email: user!.email,
              name: user!.name,
              role: user!.role,
              doctorId: user!.doctor?.id ?? null,
            };
          }

          const email = readString(credentials?.email).toLowerCase();
          const password =
            typeof credentials?.password === "string" ? credentials.password : "";
          if (!email || !password) return null;

          const emailKey = `login:email:${email}`;
          if (await isLoginLocked(emailKey)) {
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
              approvalStatus: true,
              doctor: { select: { id: true } },
            },
          });

          const passwordOk = user
            ? await verifyPassword(password, user.passwordHash)
            : false;

          if (
            !user ||
            !user.isActive ||
            user.approvalStatus !== "APPROVED" ||
            user.role !== role ||
            !passwordOk
          ) {
            await recordLoginFailure(emailKey);
            await recordLoginFailure(ipKey);
            return null;
          }

          await clearLoginFailures(emailKey);
          await clearLoginFailures(ipKey);
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
        session.user.doctorId =
          typeof token.doctorId === "string" ? token.doctorId : null;
      }
      return session;
    },
  },
});
