"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import type { StaffRole } from "@/lib/auth/types";
import { showSuccess } from "@/lib/toast";

const WELCOME_COPY: Record<StaffRole, string> = {
  ADMIN: "Welcome back. You are signed in to the admin dashboard.",
  DOCTOR: "Welcome back. You are signed in to the doctor dashboard.",
};

export function WelcomeToast({ role }: { role: StaffRole }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current || searchParams.get("welcome") !== "1") return;
    shown.current = true;
    showSuccess(WELCOME_COPY[role], { id: "staff-welcome" });

    const next = new URLSearchParams(searchParams.toString());
    next.delete("welcome");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, role, router, searchParams]);

  return null;
}
