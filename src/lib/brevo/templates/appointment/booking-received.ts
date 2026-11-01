import { getClinicConfig } from "../../config";
import type { BookingReceivedEmailData, RenderedEmail } from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { detailsTable, highlightBox } from "../shared/layout";
import { appointmentRows, appointmentTextBlock } from "./_shared";

export function renderBookingReceivedEmail(
  data: BookingReceivedEmailData,
): RenderedEmail {
  const config = getClinicConfig();
  const patientName = escapeHtml(data.patientName);
  const notes = data.notes?.trim()
    ? highlightBox(`<strong>Notes:</strong> ${escapeHtml(data.notes.trim())}`)
    : "";

  const htmlBody = `
    ${greetingHtml(patientName)}
    <p style="margin:0 0 12px 0;">We received your appointment booking request. Our team will confirm the details shortly.</p>
    ${detailsTable(
      appointmentRows(data.appointment, {
        doctorName: data.doctorName,
        bookingReference: data.bookingReference,
      }),
    )}
    ${notes}
    ${closingHtml(escapeHtml(config.clinicName))}
  `.trim();

  const textBody = [
    `Hello ${sanitizeText(data.patientName)},`,
    "",
    "We received your appointment booking request. Our team will confirm the details shortly.",
    "",
    appointmentTextBlock(data.appointment, {
      doctorName: data.doctorName,
      bookingReference: data.bookingReference,
    }),
    data.notes?.trim() ? `\nNotes: ${sanitizeText(data.notes.trim())}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return renderWithLayout(
    {
      title: "Booking received",
      preheader: "We received your appointment request.",
      htmlBody,
      textBody,
    },
    `Booking received — ${data.bookingReference}`,
    config,
  );
}
