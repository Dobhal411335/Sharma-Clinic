export const WEEKDAY_VALUES = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export type WeekdayValue = (typeof WEEKDAY_VALUES)[number];

export const AVAILABILITY_SCOPE_VALUES = [
  "FIXED",
  "TEMPORARY",
  "CUSTOM",
] as const;

export type AvailabilityScopeValue = (typeof AVAILABILITY_SCOPE_VALUES)[number];

export type DoctorAvailabilityWindow = {
  id?: string;
  weekday: WeekdayValue;
  startTimeLocal: string;
  endTimeLocal: string;
  slotDurationMinutes: number;
};

/** How Temporary / Custom duration is computed. Fixed ignores this (open-ended). */
export type DoctorAvailabilityApplyMode =
  | "WEEK"
  | "MONTH"
  | "NEXT_WEEKS"
  | "NEXT_MONTHS"
  | "UNTIL_DATE"
  | "DATE_RANGE";

export type DoctorAvailabilityPayload = {
  windows: DoctorAvailabilityWindow[];
  scope: AvailabilityScopeValue;
  applyMode: DoctorAvailabilityApplyMode;
  /** Weekdays included when applying; defaults to weekdays present in windows. */
  applyWeekdays?: WeekdayValue[];
  /** Used with NEXT_WEEKS / NEXT_MONTHS. */
  repeatCount?: number;
  /** Used with UNTIL_DATE (YYYY-MM-DD). */
  untilDate?: string;
  /** Used with DATE_RANGE / CUSTOM (YYYY-MM-DD). */
  rangeStart?: string;
  rangeEnd?: string;
};

export type DoctorAvailabilityDtoWindow = DoctorAvailabilityWindow & {
  id: string;
  scope: AvailabilityScopeValue;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
  isActive: boolean;
};

export type DoctorAvailabilityDto = {
  doctorId: string;
  windows: DoctorAvailabilityDtoWindow[];
};

export type DoctorWeekScheduleCell = {
  date: string;
  weekday: WeekdayValue;
  startTimeLocal: string;
  endTimeLocal: string;
  scope: AvailabilityScopeValue;
  /** Remaining bookable patient slots inside this window. */
  slotsRemaining: number;
  /** First free slot start (`HH:mm`), used for booking deep-link. */
  nextSlotStart: string | null;
  /** Empty when unavailable (fully booked / past). */
  href: string;
  available: boolean;
};

export type DoctorWeekSchedule = {
  weekStart: string;
  weekEnd: string;
  days: Array<{
    date: string;
    weekday: WeekdayValue;
    label: string;
    windows: DoctorWeekScheduleCell[];
  }>;
  timeRows: string[];
};
