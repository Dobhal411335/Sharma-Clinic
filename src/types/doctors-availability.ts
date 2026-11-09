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

export type DoctorAvailabilityWindow = {
  id?: string;
  weekday: WeekdayValue;
  startTimeLocal: string;
  endTimeLocal: string;
  slotDurationMinutes: number;
};

export type DoctorAvailabilityApplyMode = "WEEK" | "MONTH";

export type DoctorAvailabilityPayload = {
  windows: DoctorAvailabilityWindow[];
  applyMode: DoctorAvailabilityApplyMode;
  /** Weekdays included when applying; defaults to weekdays present in windows. */
  applyWeekdays?: WeekdayValue[];
};

export type DoctorAvailabilityDto = {
  doctorId: string;
  windows: Array<
    DoctorAvailabilityWindow & {
      id: string;
      effectiveFrom: string | null;
      effectiveUntil: string | null;
      isActive: boolean;
    }
  >;
};
