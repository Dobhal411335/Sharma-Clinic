import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminDashboardSummary } from "@/features/reports/admin-dashboard-summary";
import { parseDashboardRange } from "@/features/reports/dashboard-range";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const range = parseDashboardRange({ from, to });
  const summary = await getAdminDashboardSummary(range);

  return <AdminDashboard summary={summary} />;
}
