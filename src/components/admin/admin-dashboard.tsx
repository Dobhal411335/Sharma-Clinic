import type { AppointmentStatus, PaymentStatus } from "@prisma/client";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  CalendarClock,
  CircleCheck,
  CircleX,
  IndianRupee,
  Stethoscope,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import type { AdminDashboardSummary } from "@/features/reports/admin-dashboard-summary";
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

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  CREATED: "Created",
  ORDER_CREATED: "Order created",
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  EXPIRED: "Expired",
  PARTIALLY_REFUNDED: "Partially refunded",
  REFUNDED: "Refunded",
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

export function AdminDashboard({ summary }: { summary: AdminDashboardSummary }) {
  const appointmentRows = summary.appointmentsByStatus
    .filter((row) => row.count > 0)
    .map((row) => ({
      label: APPOINTMENT_LABELS[row.status],
      count: row.count,
    }));
  const paymentRows = summary.paymentsByStatus
    .filter((row) => row.count > 0)
    .map((row) => ({
      label: PAYMENT_LABELS[row.status],
      count: row.count,
    }));
  const appointmentTotal = summary.totalAppointments;
  const paymentTotal = summary.paymentsByStatus.reduce((sum, row) => sum + row.count, 0);
  const leading = appointmentRows.reduce(
    (best, row) => (row.count > best ? row.count : best),
    0,
  );

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Clinic totals">
        <MetricCard
          href="/admin/reports/day/confirm"
          label="Appointments"
          value={String(summary.totalAppointments)}
          hint="Booked in this range"
          icon={<CalendarCheck {...iconProps} />}
        />
        <MetricCard
          href="/admin/reports/revenue"
          label="Collected"
          value={formatPaiseToInr(summary.paidAmountPaise)}
          hint="Completed payments only"
          icon={<IndianRupee {...iconProps} />}
        />
        <MetricCard
          href="/admin/reports/day/confirm"
          label="Confirmed"
          value={String(summary.confirmedAppointments)}
          hint="Ready for the day"
          icon={<CircleCheck {...iconProps} />}
        />
        <MetricCard
          href="/admin/reports/gateway/booked"
          label="Pending payment"
          value={String(summary.pendingAppointments)}
          hint="Awaiting payment"
          icon={<CalendarClock {...iconProps} />}
        />
        <MetricCard
          href="/admin/reports/day/next-day"
          label="Completed"
          value={String(summary.completedAppointments)}
          hint="Visits finished"
          icon={<Stethoscope {...iconProps} />}
        />
        <MetricCard
          href="/admin/doctors/profiles"
          label="Doctors"
          value={String(summary.totalDoctors)}
          hint="Active doctor profiles"
          icon={<UserRound {...iconProps} />}
        />
        <MetricCard
          href="/admin/reports/gateway/failure"
          label="Failed payments"
          value={String(summary.failedPaymentCount)}
          hint="Failed in this range"
          icon={<CircleX {...iconProps} />}
        />
        <MetricCard
          href="/admin/reports/gateway/success"
          label="Paid payments"
          value={String(summary.paidPaymentCount)}
          hint="Paid in this range"
          icon={<BadgeCheck {...iconProps} />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
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
        <Panel title="Payments" hint="Collected in this range">
          <p className="text-[1.75rem] leading-none font-semibold text-[#1a1d21] tabular-nums">
            {formatPaiseToInr(summary.paidAmountPaise)}
          </p>
          <p className="mt-2 text-sm text-[#667085]">
            {summary.paidPaymentCount} paid · {summary.failedPaymentCount} failed
          </p>
          {paymentTotal === 0 ? (
            <p className="mt-4 text-sm text-[#667085]">No payments in this range</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {paymentRows.map((row) => {
                const width = Math.max(4, Math.round((row.count / paymentTotal) * 100));
                return (
                  <li key={row.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{row.label}</span>
                      <span className="tabular-nums">{row.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-sm bg-[#e8eef2]">
                      <div className="h-full bg-[#c5ced6]" style={{ width: `${width}%` }} />
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
