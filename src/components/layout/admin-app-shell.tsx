import type { ReactNode } from "react";

/**
 * The clinic admin shell already titles every screen.
 * Copied forms render only their fields here.
 */
export function AdminAppShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
