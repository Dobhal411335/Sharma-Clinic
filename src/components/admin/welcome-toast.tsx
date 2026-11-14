"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import type { StaffRole } from "@/lib/auth/types";
import { showSuccess } from "@/lib/toast";

function welcomeMessage(role: StaffRole, name?: string | null): string {
  const trimmed = name?.trim();
  if (role === "DOCTOR") {
    if (trimmed) {
      const display = trimmed.replace(/^dr\.?\s+/i, "");
      return `Welcome back, Dr. ${display}.`;
    }
    return "Welcome back. You are signed in to the doctor dashboard.";
  }
  return "Welcome back. You are signed in to the admin dashboard.";
}

export function WelcomeToast({
  role,
  name,
}: {
  role: StaffRole;
  name?: string | null;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current || searchParams.get("welcome") !== "1") return;
    shown.current = true;
    showSuccess(welcomeMessage(role, name), { id: "staff-welcome" });

    const next = new URLSearchParams(searchParams.toString());
    next.delete("welcome");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [name, pathname, role, router, searchParams]);

  return null;
}
