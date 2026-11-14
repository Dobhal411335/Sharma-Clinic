import { LogOut } from "lucide-react";

import { signOut } from "@/auth";
import type { StaffRole } from "@/lib/auth/types";

export function SignOutButton({
  appearance = "sidebar",
  role,
}: {
  appearance?: "sidebar" | "header";
  role?: StaffRole;
}) {
  const className =
    appearance === "header"
      ? "inline-flex size-9 items-center justify-center rounded-md text-[#1d3b68] hover:bg-[#e8eef2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#287f79]"
      : "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm text-sidebar-foreground hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7dcec7]";

  const redirectTo =
    role === "ADMIN" || role === "DOCTOR"
      ? `/login?signedOut=1&role=${role}`
      : "/login?signedOut=1";

  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo });
      }}
    >
      <button
        type="submit"
        className={className}
        aria-label={appearance === "header" ? "Sign out" : undefined}
      >
        <LogOut className="size-4" aria-hidden />
        {appearance === "sidebar" ? <span>Sign out</span> : null}
      </button>
    </form>
  );
}
