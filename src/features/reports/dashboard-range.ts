export const CLINIC_TIME_ZONE = "Asia/Kolkata";

const CLINIC_OFFSET_MINUTES = 5 * 60 + 30;

export type DashboardRange = {
  from: string;
  to: string;
  fromUtc: Date;
  toUtcExclusive: Date;
};

export function formatClinicDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatClinicDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: CLINIC_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(clinicDayStartUtc(isoDate));
}

export function addIsoDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  const nextYear = utc.getUTCFullYear();
  const nextMonth = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(utc.getUTCDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

/** Midnight at the start of a clinic-local calendar day, as a UTC instant. */
export function clinicDayStartUtc(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - CLINIC_OFFSET_MINUTES * 60 * 1000);
}

export function defaultDashboardRange(now = new Date()): { from: string; to: string } {
  const to = formatClinicDate(now);
  return { from: addIsoDays(to, -29), to };
}

function isIsoDate(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day
  );
}

export function parseDashboardRange(
  input: { from?: string; to?: string },
  now = new Date(),
): DashboardRange {
  const fallback = defaultDashboardRange(now);
  let from = isIsoDate(input.from) ? input.from : fallback.from;
  let to = isIsoDate(input.to) ? input.to : fallback.to;
  if (from > to) {
    const swap = from;
    from = to;
    to = swap;
  }

  return {
    from,
    to,
    fromUtc: clinicDayStartUtc(from),
    toUtcExclusive: clinicDayStartUtc(addIsoDays(to, 1)),
  };
}
