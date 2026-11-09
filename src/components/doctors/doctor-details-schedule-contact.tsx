import { Mail, Phone } from "lucide-react";

import { formatTimeRangeAmPm } from "@/lib/doctor-time";
import type { DoctorProfile } from "@/types/doctors";
import type { WeekdayValue } from "@/types/doctors-availability";
import { WEEKDAY_VALUES } from "@/types/doctors-availability";

const WEEKDAY_LABELS: Record<WeekdayValue, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export type DoctorPublicScheduleWindow = {
  weekday: WeekdayValue;
  startTimeLocal: string;
  endTimeLocal: string;
};

type ScheduleRow = {
  day: string;
  hours: string;
};

function buildScheduleRows(windows: DoctorPublicScheduleWindow[]): ScheduleRow[] {
  const byDay = new Map<WeekdayValue, string[]>();
  for (const window of windows) {
    const label = formatTimeRangeAmPm(window.startTimeLocal, window.endTimeLocal);
    const list = byDay.get(window.weekday) ?? [];
    list.push(label);
    byDay.set(window.weekday, list);
  }

  return WEEKDAY_VALUES.filter((day) => byDay.has(day)).map((day) => ({
    day: WEEKDAY_LABELS[day],
    hours: (byDay.get(day) ?? []).join(", "),
  }));
}

type DoctorDetailsScheduleContactProps = {
  doctor: DoctorProfile;
  scheduleWindows?: DoctorPublicScheduleWindow[];
};

export function DoctorDetailsScheduleContact({
  doctor,
  scheduleWindows = [],
}: DoctorDetailsScheduleContactProps) {
  const schedule = buildScheduleRows(scheduleWindows);
  const email = doctor.email.trim();
  const phone = doctor.phone.trim();
  const hasContact = Boolean(email || phone);

  if (schedule.length === 0 && !hasContact) {
    return null;
  }

  return (
    <section className="bg-[#f8f5ee]" aria-label="Schedule and contact">
      <div className="container-page space-y-6 pb-14 sm:pb-16 lg:pb-20">
        {schedule.length > 0 ? (
          <div className="rounded-[20px] bg-white px-6 py-7 shadow-[0_8px_28px_rgba(40,30,20,0.04)] sm:px-8 sm:py-8">
            <h2 className="text-xl font-bold tracking-tight text-[#1f2937] sm:text-2xl">
              My Time Schedule
            </h2>
            <ul className="mt-6 divide-y divide-[#ececec]">
              {schedule.map((row) => (
                <li
                  key={row.day}
                  className="flex items-center justify-between gap-4 py-3.5 text-sm text-[#374151] sm:text-[15px]"
                >
                  <span className="font-medium">{row.day}</span>
                  <span className="text-right text-[#4b5563]">{row.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {hasContact ? (
          <div className="rounded-[20px] bg-white px-6 py-6 shadow-[0_8px_28px_rgba(40,30,20,0.04)] sm:px-8">
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-0">
              {email ? (
                <div className="flex items-center gap-4 sm:pr-10">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#1f6f73] text-white">
                    <Mail className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-[#1f2937]">
                      Send us a Mail
                    </p>
                    <a
                      href={`mailto:${email}`}
                      className="mt-0.5 block truncate text-sm text-[#6b7280] transition-colors hover:text-[#168b91]"
                    >
                      {email}
                    </a>
                  </div>
                </div>
              ) : null}

              {phone ? (
                <div
                  className={
                    email
                      ? "flex items-center gap-4 border-t border-[#ececec] pt-6 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-10"
                      : "flex items-center gap-4"
                  }
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#1f6f73] text-white">
                    <Phone className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-[#1f2937]">Call Us:</p>
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="mt-0.5 block truncate text-sm text-[#6b7280] transition-colors hover:text-[#168b91]"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
