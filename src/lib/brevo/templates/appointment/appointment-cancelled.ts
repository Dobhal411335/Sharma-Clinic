import { getClinicConfig } from "../../config";
import type { AppointmentCancelledEmailData, RenderedEmail } from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { detailsTable, highlightBox, primaryButton } from "../shared/layout";
import { appointmentRows, appointmentTextBlock } from "./_shared";

export function renderAppointmentCancelledEmail(
  data: AppointmentCancelledEmailData,
): RenderedEmail {
  const config = getClinicConfig();
  const patientName = escapeHtml(data.patientName);
  const reason = data.cancellationReason?.trim()
    ? highlightBox(
        `<strong>Reason:</strong> ${escapeHtml(data.cancellationReason.trim())}`,
      )
    : "";
  const button = data.rebookUrl
    ? primaryButton("Book another appointment", data.rebookUrl)
    : "";

  const htmlBody = `
    ${greetingHtml(patientName)}
    <p style="margin:0 0 12px 0;">Your appointment has been <strong>cancelled</strong>.</p>
    ${detailsTable(
      appointmentRows(data.appointment, {
        doctorName: data.doctorName,
        bookingReference: data.bookingReference,
      }),
    )}
    ${reason}
    ${button}
    ${closingHtml(escapeHtml(config.clinicName))}
  `.trim();

  const textBody = [
    `Hello ${sanitizeText(data.patientName)},`,
    "",
    "Your appointment has been cancelled.",
    "",
    appointmentTextBlock(data.appointment, {
      doctorName: data.doctorName,
      bookingReference: data.bookingReference,
    }),
    data.cancellationReason?.trim()
      ? `\nReason: ${sanitizeText(data.cancellationReason.trim())}`
      : "",
    data.rebookUrl ? `\nBook again: ${data.rebookUrl}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return renderWithLayout(
    {
      title: "Appointment cancelled",
      preheader: "Your appointment has been cancelled.",
      htmlBody,
      textBody,
    },
    `Appointment cancelled — ${data.bookingReference}`,
    config,
  );
}
