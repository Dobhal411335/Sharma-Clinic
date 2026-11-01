import type { AppointmentSlot } from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { detailRow } from "../shared/layout";

export function appointmentRows(
  appointment: AppointmentSlot,
  extras?: { doctorName?: string; bookingReference?: string; locationLabel?: string },
): string {
  const rows = [
    extras?.bookingReference
      ? detailRow("Reference", escapeHtml(extras.bookingReference))
      : "",
    extras?.doctorName
      ? detailRow("Doctor", escapeHtml(extras.doctorName))
      : "",
    detailRow("When", escapeHtml(appointment.startsAtLabel)),
    appointment.endsAtLabel
      ? detailRow("Ends", escapeHtml(appointment.endsAtLabel))
      : "",
    appointment.timezoneLabel
      ? detailRow("Timezone", escapeHtml(appointment.timezoneLabel))
      : "",
    extras?.locationLabel
      ? detailRow("Location", escapeHtml(extras.locationLabel))
      : "",
  ];

  return rows.filter(Boolean).join("\n");
}

export function appointmentTextBlock(
  appointment: AppointmentSlot,
  extras?: { doctorName?: string; bookingReference?: string; locationLabel?: string },
): string {
  return [
    extras?.bookingReference
      ? `Reference: ${sanitizeText(extras.bookingReference)}`
      : undefined,
    extras?.doctorName ? `Doctor: ${sanitizeText(extras.doctorName)}` : undefined,
    `When: ${sanitizeText(appointment.startsAtLabel)}`,
    appointment.endsAtLabel
      ? `Ends: ${sanitizeText(appointment.endsAtLabel)}`
      : undefined,
    appointment.timezoneLabel
      ? `Timezone: ${sanitizeText(appointment.timezoneLabel)}`
      : undefined,
    extras?.locationLabel
      ? `Location: ${sanitizeText(extras.locationLabel)}`
      : undefined,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}
