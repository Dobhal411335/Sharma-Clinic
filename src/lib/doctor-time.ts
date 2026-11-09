/** Convert `HH:mm` (24h) to a display like `11:00 AM`. */
export function formatTimeAmPm(hhmm: string): string {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm.trim());
  if (!match) return hhmm;
  const hours24 = Number(match[1]);
  const minutes = match[2];
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes} ${period}`;
}

export function formatTimeRangeAmPm(start: string, end: string): string {
  return `${formatTimeAmPm(start)} – ${formatTimeAmPm(end)}`;
}

export function windowCapacityPatients(
  startTimeLocal: string,
  endTimeLocal: string,
  slotDurationMinutes: number,
): number {
  const toMinutes = (value: string) => {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
    if (!match) return 0;
    return Number(match[1]) * 60 + Number(match[2]);
  };
  if (slotDurationMinutes <= 0) return 0;
  const span = toMinutes(endTimeLocal) - toMinutes(startTimeLocal);
  if (span <= 0) return 0;
  return Math.floor(span / slotDurationMinutes);
}
