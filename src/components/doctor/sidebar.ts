/**
 * Doctor navigation. Framework-free so server and client can share it.
 */

export type DoctorIconName =
  | "layout-dashboard"
  | "clipboard-list"
  | "id-card";

export type DoctorNavItem = {
  title: string;
  href: string;
  icon?: DoctorIconName;
  description?: string;
};

export const doctorNav: DoctorNavItem[] = [
  {
    title: "Dashboard",
    href: "/doctor/dashboard",
    icon: "layout-dashboard",
    description: "Review your patients, appointments, and fees for the selected dates.",
  },
  {
    title: "Appointments",
    href: "/doctor/appointments",
    icon: "clipboard-list",
    description: "Review your appointments and update their status.",
  },
  {
    title: "Profile",
    href: "/doctor/profile",
    icon: "id-card",
    description: "Update your public profile and weekly availability.",
  },
];

export function findDoctorTrail(
  pathname: string,
  items: DoctorNavItem[] = doctorNav,
): DoctorNavItem[] | null {
  for (const item of items) {
    if (item.href === pathname) return [item];
  }
  return null;
}

export function findDoctorNavItem(pathname: string): DoctorNavItem | null {
  return findDoctorTrail(pathname)?.at(-1) ?? null;
}
