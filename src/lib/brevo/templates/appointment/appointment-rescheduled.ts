import { getClinicConfig } from "../../config";
import type {
  AppointmentRescheduledEmailData,
  RenderedEmail,
} from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { detailRow, detailsTable, primaryButton } from "../shared/layout";

export function renderAppointmentRescheduledEmail(
  data: AppointmentRescheduledEmailData,
): RenderedEmail {
  const config = getClinicConfig();
  const patientName = escapeHtml(data.patientName);
  const button = data.manageUrl
    ? primaryButton("View updated appointment", data.manageUrl)
    : "";

  const htmlBody = `
    ${greetingHtml(patientName)}
    <p style="margin:0 0 12px 0;">Your appointment has been <strong>rescheduled</strong>. Please review the new time below.</p>
    ${detailsTable(
      [
        detailRow("Reference", escapeHtml(data.bookingReference)),
        detailRow("Doctor", escapeHtml(data.doctorName)),
        detailRow("Previous time", escapeHtml(data.previousAppointment.startsAtLabel)),
        detailRow("New time", `<strong>${escapeHtml(data.newAppointment.startsAtLabel)}</strong>`),
        data.newAppointment.timezoneLabel
          ? detailRow("Timezone", escapeHtml(data.newAppointment.timezoneLabel))
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    )}
    ${button}
    ${closingHtml(escapeHtml(config.clinicName))}
  `.trim();

  const textBody = [
    `Hello ${sanitizeText(data.patientName)},`,
    "",
    "Your appointment has been rescheduled. Please review the new time below.",
    "",
    `Reference: ${sanitizeText(data.bookingReference)}`,
    `Doctor: ${sanitizeText(data.doctorName)}`,
    `Previous time: ${sanitizeText(data.previousAppointment.startsAtLabel)}`,
    `New time: ${sanitizeText(data.newAppointment.startsAtLabel)}`,
    data.newAppointment.timezoneLabel
      ? `Timezone: ${sanitizeText(data.newAppointment.timezoneLabel)}`
      : undefined,
    data.manageUrl ? `\nView details: ${data.manageUrl}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  return renderWithLayout(
    {
      title: "Appointment rescheduled",
      preheader: `New time: ${data.newAppointment.startsAtLabel}.`,
      htmlBody,
      textBody,
    },
    `Appointment rescheduled — ${data.bookingReference}`,
    config,
  );
}
