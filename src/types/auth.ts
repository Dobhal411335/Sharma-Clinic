import type { Role } from "@prisma/client";

export type UserRole = Role;

export type RoleRoute = {
  role: UserRole;
  path: string;
};
