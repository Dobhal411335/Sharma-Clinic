import type { Metadata } from "next";

import { auth } from "@/auth";
import { DoctorDashboard } from "@/components/doctor/doctor-dashboard";
import { resolveDoctorIdForUser } from "@/features/doctors/doctor-availability.service";
import { getDoctorDashboardSummary } from "@/features/reports/doctor-dashboard-summary";
import { parseDashboardRange } from "@/features/reports/dashboard-range";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DoctorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await auth();
  const doctorId =
    session?.user?.doctorId ??
    (session?.user?.id ? await resolveDoctorIdForUser(session.user.id) : null);

  if (!doctorId) {
    return (
      <div className="rounded-xl border border-[#e7ebef] bg-white p-6 text-sm text-[#667085]">
        Your account is not linked to a doctor profile yet. Contact the clinic admin.
      </div>
    );
  }

  const { from, to } = await searchParams;
  const range = parseDashboardRange({ from, to });
  const summary = await getDoctorDashboardSummary(doctorId, range);

  return <DoctorDashboard summary={summary} />;
}
