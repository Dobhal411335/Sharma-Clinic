import type { AppointmentStatus } from "@prisma/client";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarClock,
  CircleCheck,
  IndianRupee,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";

import type { DoctorDashboardSummary } from "@/features/reports/doctor-dashboard-summary";
import { formatPaiseToInr } from "@/lib/utils";

const APPOINTMENT_LABELS: Record<AppointmentStatus, string> = {
  PENDING_PAYMENT: "Pending payment",
  PENDING: "Pending acceptance",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No show",
  EXPIRED: "Expired",
};

const cardClass =
  "block rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] ring-1 ring-[#e7ebef] transition-colors hover:bg-[#fbfcfd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#287f79]";

function MetricCard({
  href,
  label,
  value,
  hint,
  icon,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <Link href={href} className={cardClass}>
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm font-medium text-[#1a1d21]">
          {label}
          <ArrowUpRight aria-hidden className="size-3.5 text-[#98a2b3]" strokeWidth={1.5} />
        </p>
        <span className="text-[#287f79]">{icon}</span>
      </div>
      <p className="mt-4 text-[1.75rem] leading-none font-semibold text-[#1a1d21] tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-sm text-[#667085]">{hint}</p>
    </Link>
  );
}

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="min-h-44 rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] ring-1 ring-[#e7ebef]">
      <h2 className="text-base font-semibold text-[#1a1d21]">{title}</h2>
      <p className="mt-1 text-sm text-[#667085]">{hint}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const iconProps = { className: "size-4", strokeWidth: 1.5 } as const;

export function DoctorDashboard({ summary }: { summary: DoctorDashboardSummary }) {
  const appointmentRows = summary.appointmentsByStatus
    .filter((row) => row.count > 0)
    .map((row) => ({
      label: APPOINTMENT_LABELS[row.status],
      count: row.count,
    }));
  const appointmentTotal = summary.totalAppointments;
  const leading = appointmentRows.reduce(
    (best, row) => (row.count > best ? row.count : best),
    0,
  );

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Doctor totals">
        <MetricCard
          href="/doctor/appointments"
          label="Patients"
          value={String(summary.uniquePatients)}
          hint="Unique patients in this range"
          icon={<Users {...iconProps} />}
        />
        <MetricCard
          href="/doctor/appointments"
          label="Appointments"
          value={String(summary.totalAppointments)}
          hint="Booked in this range"
          icon={<CalendarCheck {...iconProps} />}
        />
        <MetricCard
          href="/doctor/appointments"
          label="Fees earned"
          value={formatPaiseToInr(summary.paidAmountPaise)}
          hint={`${summary.paidPaymentCount} paid payment${summary.paidPaymentCount === 1 ? "" : "s"}`}
          icon={<IndianRupee {...iconProps} />}
        />
        <MetricCard
          href="/doctor/appointments"
          label="Pending acceptance"
          value={String(summary.pendingAcceptance)}
          hint="Waiting for your review"
          icon={<UserRound {...iconProps} />}
        />
        <MetricCard
          href="/doctor/appointments"
          label="Accepted"
          value={String(summary.acceptedAppointments)}
          hint="Upcoming confirmed visits"
          icon={<CircleCheck {...iconProps} />}
        />
        <MetricCard
          href="/doctor/appointments"
          label="Completed"
          value={String(summary.completedAppointments)}
          hint="Visits finished"
          icon={<Stethoscope {...iconProps} />}
        />
        <MetricCard
          href="/doctor/appointments"
          label="Pending payment"
          value={String(summary.pendingPaymentCount)}
          hint="Awaiting patient payment"
          icon={<CalendarClock {...iconProps} />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-1">
        <Panel title="Appointments by status" hint="Booked in this range">
          {appointmentTotal === 0 ? (
            <p className="text-sm text-[#667085]">No appointments in this range</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {appointmentRows.map((row) => {
                const width = Math.max(4, Math.round((row.count / appointmentTotal) * 100));
                const accent = row.count === leading;
                return (
                  <li key={row.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-[#1a1d21]">{row.label}</span>
                      <span className="font-medium text-[#1a1d21] tabular-nums">{row.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-sm bg-[#e8eef2]">
                      <div
                        className={accent ? "h-full bg-[#287f79]" : "h-full bg-[#c5ced6]"}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}
