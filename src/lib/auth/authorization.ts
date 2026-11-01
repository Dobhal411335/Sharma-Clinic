import type { Role } from "@prisma/client";
import type { Session } from "next-auth";

export function hasRole(session: Session | null, role: Role): boolean {
  return session?.user?.role === role;
}

export function getDashboardPath(role: Role): string {
  return role === "ADMIN" ? "/admin/dashboard" : "/doctor/dashboard";
}
