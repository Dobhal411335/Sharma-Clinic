import { getClinicConfig } from "../../config";
import type {
  DoctorAppointmentCancelledEmailData,
  RenderedEmail,
} from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { detailRow, detailsTable, highlightBox, primaryButton } from "../shared/layout";
import {
  appointmentRows,
  appointmentTextBlock,
} from "../appointment/_shared";

export async function renderAppointmentCancelledDoctorEmail(
  data: DoctorAppointmentCancelledEmailData,
): Promise<RenderedEmail> {
  const config = await getClinicConfig();
  const doctorName = escapeHtml(data.doctorName);
  const reason = data.cancellationReason?.trim()
    ? highlightBox(
        `<strong>Reason:</strong> ${escapeHtml(data.cancellationReason.trim())}`,
      )
    : "";
  const button = data.dashboardUrl
    ? primaryButton("Open dashboard", data.dashboardUrl)
    : "";

  const htmlBody = `
    ${greetingHtml(doctorName)}
    <p style="margin:0 0 12px 0;">An appointment on your schedule has been <strong>cancelled</strong>.</p>
    ${detailsTable(
      [
        detailRow("Patient", escapeHtml(data.patientName)),
        appointmentRows(data.appointment, {
          bookingReference: data.bookingReference,
        }),
      ].join("\n"),
    )}
    ${reason}
    ${button}
    ${closingHtml(escapeHtml(config.clinicName))}
  `.trim();

  const textBody = [
    `Hello ${sanitizeText(data.doctorName)},`,
    "",
    "An appointment on your schedule has been cancelled.",
    "",
    `Patient: ${sanitizeText(data.patientName)}`,
    appointmentTextBlock(data.appointment, {
      bookingReference: data.bookingReference,
    }),
    data.cancellationReason?.trim()
      ? `\nReason: ${sanitizeText(data.cancellationReason.trim())}`
      : "",
    data.dashboardUrl ? `\nDashboard: ${data.dashboardUrl}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return await renderWithLayout(
    {
      title: "Appointment cancelled",
      preheader: `Cancelled booking ${data.bookingReference}.`,
      htmlBody,
      textBody,
    },
    `Cancelled appointment — ${data.bookingReference}`,
    config,
  );
}
