import { getClinicConfig } from "../../config";
import type { DoctorNewAppointmentEmailData, RenderedEmail } from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { detailRow, detailsTable, highlightBox, primaryButton } from "../shared/layout";
import {
  appointmentRows,
  appointmentTextBlock,
} from "../appointment/_shared";

export function renderNewAppointmentDoctorEmail(
  data: DoctorNewAppointmentEmailData,
): RenderedEmail {
  const config = getClinicConfig();
  const doctorName = escapeHtml(data.doctorName);
  const notes = data.notes?.trim()
    ? highlightBox(
        `<strong>Patient notes:</strong> ${escapeHtml(data.notes.trim())}`,
      )
    : "";
  const button = data.dashboardUrl
    ? primaryButton("Open dashboard", data.dashboardUrl)
    : "";

  const htmlBody = `
    ${greetingHtml(doctorName)}
    <p style="margin:0 0 12px 0;">You have a <strong>new appointment</strong> booking.</p>
    ${detailsTable(
      [
        detailRow("Patient", escapeHtml(data.patientName)),
        appointmentRows(data.appointment, {
          bookingReference: data.bookingReference,
        }),
      ].join("\n"),
    )}
    ${notes}
    ${button}
    ${closingHtml(escapeHtml(config.clinicName))}
  `.trim();

  const textBody = [
    `Hello ${sanitizeText(data.doctorName)},`,
    "",
    "You have a new appointment booking.",
    "",
    `Patient: ${sanitizeText(data.patientName)}`,
    appointmentTextBlock(data.appointment, {
      bookingReference: data.bookingReference,
    }),
    data.notes?.trim()
      ? `\nPatient notes: ${sanitizeText(data.notes.trim())}`
      : "",
    data.dashboardUrl ? `\nDashboard: ${data.dashboardUrl}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return renderWithLayout(
    {
      title: "New appointment",
      preheader: `New booking with ${data.patientName}.`,
      htmlBody,
      textBody,
    },
    `New appointment — ${data.bookingReference}`,
    config,
  );
}
