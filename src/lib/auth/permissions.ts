import { getDashboardPath } from "@/lib/auth/paths";
import type { StaffRole } from "@/lib/auth/types";

export { getDashboardPath };

type RoleCarrier = { role?: string | null } | null | undefined;

export function isAdmin(user: RoleCarrier): boolean {
  return user?.role === "ADMIN";
}

export function isDoctor(user: RoleCarrier): boolean {
  return user?.role === "DOCTOR";
}

export function hasRole(user: RoleCarrier, role: StaffRole): boolean {
  return user?.role === role;
}
