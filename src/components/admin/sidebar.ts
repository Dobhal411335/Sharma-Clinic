/**
 * Admin navigation. The visible clinic name comes from company basic info.
 *
 * Drop a page from another project onto the matching `href` by adding
 * `src/app/admin/<path>/page.tsx`. See docs/admin-page-drop-in.md.
 * This file stays free of React components so server and client code can share it.
 */

export type AdminIconName =
  | "layout-dashboard"
  | "building-2"
  | "images"
  | "menu"
  | "share-2"
  | "file-plus"
  | "panel-bottom"
  | "image"
  | "app-window"
  | "megaphone"
  | "info"
  | "badge-percent"
  | "sparkles"
  | "shield-check"
  | "circle-help"
  | "newspaper"
  | "star"
  | "stethoscope"
  | "user-plus"
  | "key-round"
  | "id-card"
  | "calendar-clock"
  | "briefcase-medical"
  | "clipboard-list"
  | "landmark"
  | "circle-check"
  | "circle-x"
  | "calendar-check"
  | "indian-rupee"
  | "calendar-days"
  | "check"
  | "calendar-plus";

export type AdminNavItem = {
  title: string;
  href?: string;
  icon?: AdminIconName;
  description?: string;
  children?: AdminNavItem[];
};

export const adminNav: AdminNavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: "layout-dashboard",
    description: "Review appointments, payments, and doctors for the selected dates.",
    children: [
      {
        title: "Company Basic Info",
        href: "/admin/company",
        icon: "building-2",
        description: "Clinic name and public contact details.",
      },
      {
        title: "Gallery Section",
        href: "/admin/gallery",
        icon: "images",
        description: "Images shown in the public gallery.",
      },
      {
        title: "Manage Navbar",
        href: "/admin/navbar",
        icon: "menu",
        description: "Links in the public site header.",
      },
      {
        title: "Social Media Post",
        href: "/admin/social-posts",
        icon: "share-2",
        description: "Social posts shown on the public site.",
      },
      {
        title: "Create Webpages",
        href: "/admin/webpages",
        icon: "file-plus",
        description: "Extra public pages.",
      },
      {
        title: "Manage Footer",
        href: "/admin/footer",
        icon: "panel-bottom",
        description: "Links and text in the public footer.",
      },
    ],
  },
  {
    title: "Banner Management",
    icon: "image",
    description: "Banners on the public website.",
    children: [
      {
        title: "Pop Up Banner",
        href: "/admin/banners/popup",
        icon: "app-window",
        description: "The popup shown on the public site.",
      },
      {
        title: "Top Advertisement Banner",
        href: "/admin/banners/top-advertisement",
        icon: "megaphone",
        description: "The strip at the top of the public site.",
      },
      {
        title: "About Us Banner",
        href: "/admin/banners/about-us",
        icon: "info",
        description: "The banner on the about section.",
      },
      {
        title: "Promo & Collection Banners",
        href: "/admin/banners/promo-collection",
        icon: "badge-percent",
        description: "Promotional and collection banners.",
      },
      {
        title: "Hero Banner",
        href: "/admin/banners/hero",
        icon: "sparkles",
        description: "The main banner on the home page.",
      },
      {
        title: "Clinical Confidence Banner",
        href: "/admin/banners/clinical-confidence",
        icon: "shield-check",
        description: "The clinical confidence banner.",
      },
    ],
  },
  {
    title: "Website FAQ Section",
    href: "/admin/faq",
    icon: "circle-help",
    description: "Questions and answers on the public site.",
  },
  {
    title: "Manage Blog",
    href: "/admin/blog",
    icon: "newspaper",
    description: "Blog posts on the public site.",
  },
  {
    title: "Approve/Reject Reviews",
    href: "/admin/reviews",
    icon: "star",
    description: "Reviews waiting for approval.",
  },
  {
    title: "Doctor's Profile",
    icon: "stethoscope",
    description: "Doctor accounts, profiles, schedules, and services.",
    children: [
      {
        title: "Create Doctor Profile",
        href: "/admin/doctors/create",
        icon: "user-plus",
        description: "Add a doctor profile.",
      },
      {
        title: "Manage Doctor Login",
        href: "/admin/doctors/logins",
        icon: "key-round",
        description: "Doctor sign-in accounts.",
      },
      {
        title: "Manage Doctor Profile Page",
        href: "/admin/doctors/profiles",
        icon: "id-card",
        description: "Public doctor profile pages.",
      },
      {
        title: "Create Time Day Schedule Or Appointment",
        href: "/admin/doctors/schedule",
        icon: "calendar-clock",
        description: "Weekly hours and appointment slots.",
      },
      {
        title: "Service We Provide",
        href: "/admin/doctors/services",
        icon: "briefcase-medical",
        description: "Services listed for doctors.",
      },
    ],
  },
  {
    title: "Appointment Order Report",
    icon: "clipboard-list",
    description: "Payment gateway results, revenue, and day appointment lists.",
    children: [
      {
        title: "Gateway Report",
        icon: "landmark",
        children: [
          {
            title: "Success",
            href: "/admin/reports/gateway/success",
            icon: "circle-check",
            description: "Paid payment attempts.",
          },
          {
            title: "Failure",
            href: "/admin/reports/gateway/failure",
            icon: "circle-x",
            description: "Failed payment attempts.",
          },
          {
            title: "Booked",
            href: "/admin/reports/gateway/booked",
            icon: "calendar-check",
            description: "Booked appointments in the gateway report.",
          },
        ],
      },
      {
        title: "Revenue Management Dashboard",
        href: "/admin/reports/revenue",
        icon: "indian-rupee",
        description: "Collected consultation fees.",
      },
      {
        title: "Day Appointment Report",
        icon: "calendar-days",
        children: [
          {
            title: "Confirm",
            href: "/admin/reports/day/confirm",
            icon: "check",
            description: "Appointments to confirm for the day.",
          },
          {
            title: "Post For Next Day",
            href: "/admin/reports/day/next-day",
            icon: "calendar-plus",
            description: "Appointments to carry to the next day.",
          },
        ],
      },
    ],
  },
];

export function findAdminTrail(
  pathname: string,
  items: AdminNavItem[] = adminNav,
  trail: AdminNavItem[] = [],
): AdminNavItem[] | null {
  for (const item of items) {
    const next = [...trail, item];
    if (item.href === pathname) return next;
    if (item.children) {
      const found = findAdminTrail(pathname, item.children, next);
      if (found) return found;
    }
  }
  return null;
}

export function findAdminNavItem(pathname: string): AdminNavItem | null {
  return findAdminTrail(pathname)?.at(-1) ?? null;
}

export function navItemContainsPath(item: AdminNavItem, pathname: string): boolean {
  if (item.href === pathname) return true;
  return item.children?.some((child) => navItemContainsPath(child, pathname)) ?? false;
}

/** Every item that has its own page, in sidebar order. */
export function listAdminDestinations(items: AdminNavItem[] = adminNav): AdminNavItem[] {
  const destinations: AdminNavItem[] = [];
  for (const item of items) {
    if (item.href) destinations.push(item);
    if (item.children) destinations.push(...listAdminDestinations(item.children));
  }
  return destinations;
}
