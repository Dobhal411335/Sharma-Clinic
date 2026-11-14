"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { showSuccess } from "@/lib/toast";

function signedOutMessage(role: string | null): string {
  if (role === "DOCTOR") {
    return "You have signed out of the doctor dashboard.";
  }
  if (role === "ADMIN") {
    return "You have signed out of the admin dashboard.";
  }
  return "You have been signed out successfully.";
}

export function SignedOutToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current || searchParams.get("signedOut") !== "1") return;
    shown.current = true;

    const role = searchParams.get("role");
    showSuccess(signedOutMessage(role), { id: "staff-signed-out" });

    const next = new URLSearchParams(searchParams.toString());
    next.delete("signedOut");
    next.delete("role");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
