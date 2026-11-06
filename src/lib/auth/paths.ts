import type { StaffRole } from "@/lib/auth/types";

export function getDashboardPath(role: StaffRole | string | null | undefined): string {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "DOCTOR") return "/doctor/dashboard";
  return "/login";
}

/** Only follow a callback that stays inside the signed-in role's area. */
export function resolvePostLoginPath(
  role: StaffRole,
  callbackUrl: string | null | undefined,
  origin?: string,
): string {
  const fallback = getDashboardPath(role);
  if (!callbackUrl) return fallback;

  let path = callbackUrl;
  if (/^https?:\/\//i.test(callbackUrl)) {
    try {
      const url = new URL(callbackUrl);
      if (origin && url.origin !== origin) return fallback;
      path = `${url.pathname}${url.search}`;
    } catch {
      return fallback;
    }
  }

  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  const prefix = role === "ADMIN" ? "/admin" : "/doctor";
  if (path === prefix || path.startsWith(`${prefix}/`)) return path;
  return fallback;
}
