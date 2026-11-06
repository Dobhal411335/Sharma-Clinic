import type { StaffRole } from "@/lib/auth/types";

declare module "next-auth" {
  interface User {
    role: StaffRole;
    doctorId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: StaffRole;
      doctorId: string | null;
      email?: string | null;
      name?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: StaffRole;
    doctorId?: string | null;
  }
}
