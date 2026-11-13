import Image from "next/image";
import Link from "next/link";

import { formatTimeRangeAmPm } from "@/lib/doctor-time";
import {
  formatDoctorDisplayName,
  type DoctorProfile,
} from "@/types/doctors";
import type { DoctorWeekSchedule } from "@/types/doctors-availability";
import { WEEKDAY_VALUES } from "@/types/doctors-availability";

type DoctorWeekScheduleSectionProps = {
  doctor: DoctorProfile;
  schedule: DoctorWeekSchedule;
};

const WEEKDAY_LABELS: Record<(typeof WEEKDAY_VALUES)[number], string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export function DoctorWeekScheduleSection({
  doctor,
  schedule,
}: DoctorWeekScheduleSectionProps) {
  const displayName = formatDoctorDisplayName(doctor.name);
  const specialty = doctor.specializations[0]?.trim() || "Consultation";

  if (schedule.timeRows.length === 0) {
    return null;
  }

  const weekLabel = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${schedule.weekStart}T12:00:00+05:30`));
  const weekEndLabel = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${schedule.weekEnd}T12:00:00+05:30`));

  return (
    <section className="bg-background pb-14 sm:pb-16 lg:pb-20" aria-label="Weekly schedule">
      <div className="container-page">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-secondary sm:text-3xl">
              Weekly schedule
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Next 7 days · {weekLabel} – {weekEndLabel}. Tap an available time to book.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[20px] border border-[#e5e9ef] bg-white">
          <table className="min-w-[920px] w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#f3f5f8]">
                <th className="w-36 border-b border-[#e5e9ef] px-4 py-3 text-xs font-bold tracking-wide text-[#5b6470] uppercase">
                  Time
                </th>
                {schedule.days.map((day) => (
                  <th
                    key={day.date}
                    className="border-b border-l border-[#e5e9ef] px-3 py-3 text-xs font-bold tracking-wide text-[#5b6470] uppercase"
                  >
                    <span className="block">{WEEKDAY_LABELS[day.weekday]}</span>
                    <span className="mt-0.5 block text-[11px] font-medium normal-case tracking-normal text-[#8a93a0]">
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "numeric",
                        month: "short",
                        timeZone: "Asia/Kolkata",
                      }).format(new Date(`${day.date}T12:00:00+05:30`))}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.timeRows.map((row) => {
                const [start, end] = row.split("-");
                return (
                  <tr key={row}>
                    <th className="border-b whitespace-nowrap border-[#e5e9ef] px-4 py-4 align-top text-sm font-semibold text-[#374151]">
                      {formatTimeRangeAmPm(start!, end!)}
                    </th>
                    {schedule.days.map((day) => {
                      const cell = day.windows.find(
                        (window) =>
                          window.startTimeLocal === start &&
                          window.endTimeLocal === end,
                      );
                      return (
                        <td
                          key={`${day.date}-${row}`}
                          className="border-b border-l border-[#e5e9ef] p-2 align-top"
                        >
                          {cell ? (
                            cell.available && cell.href ? (
                              <Link
                                href={cell.href}
                                className="block rounded px-3 py-3 transition-colors hover:bg-[#eef7f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              >
                                <p className="text-sm font-semibold leading-snug text-secondary">
                                  {specialty}
                                </p>
                                <span className="mt-2 flex items-center gap-2">
                                  <span className="relative size-7 overflow-hidden rounded-full bg-muted">
                                    <Image
                                      src={doctor.photoUrl}
                                      alt=""
                                      fill
                                      className="object-cover object-top"
                                      sizes="28px"
                                    />
                                  </span>
                                  <span className="truncate text-xs font-medium text-[#5b6470]">
                                    {displayName}
                                  </span>
                                </span>
                                {cell.slotsRemaining > 0 ? (
                                  <p className="mt-2 text-[12px] font-medium text-primary">
                                    {cell.slotsRemaining} slot
                                    {cell.slotsRemaining === 1 ? "" : "s"} left
                                  </p>
                                ) : null}
                              </Link>
                            ) : (
                              <div
                                className="rounded px-3 py-3 opacity-60"
                                aria-disabled="true"
                              >
                                <p className="text-sm font-semibold leading-snug text-secondary">
                                  {specialty}
                                </p>
                                <p className="mt-2 inline-flex rounded-full bg-[#f3e8e8] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#b42318] uppercase">
                                  Unavailable
                                </p>
                              </div>
                            )
                          ) : (
                            <span className="block min-h-16" aria-hidden />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
