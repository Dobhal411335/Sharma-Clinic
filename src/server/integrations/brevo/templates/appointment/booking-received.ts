import { getClinicConfig } from "../../config";
import type { BookingReceivedEmailData, RenderedEmail } from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { detailRow, detailsTable, highlightBox } from "../shared/layout";
import { appointmentRows, appointmentTextBlock } from "./_shared";

export async function renderBookingReceivedEmail(
  data: BookingReceivedEmailData,
): Promise<RenderedEmail> {
  const config = await getClinicConfig();
  const patientName = escapeHtml(data.patientName);
  const bookingStatus = data.bookingStatus?.trim() || "Received — awaiting confirmation";
  const paymentStatus = data.paymentStatus?.trim();
  const nextSteps =
    data.nextSteps?.trim() ||
    "We will confirm your appointment shortly. This email is not a confirmation yet.";
  const notes = data.notes?.trim()
    ? highlightBox(`<strong>Notes:</strong> ${escapeHtml(data.notes.trim())}`)
    : "";

  const statusRows = [
    detailRow("Status", escapeHtml(bookingStatus)),
    paymentStatus ? detailRow("Payment", escapeHtml(paymentStatus)) : "",
  ]
    .filter(Boolean)
    .join("\n");

  const htmlBody = `
    ${greetingHtml(patientName)}
    <p style="margin:0 0 12px 0;">We received your appointment booking request. <strong>Your appointment is not confirmed yet.</strong></p>
    ${detailsTable(
      [
        appointmentRows(data.appointment, {
          doctorName: data.doctorName,
          bookingReference: data.bookingReference,
        }),
        statusRows,
      ].join("\n"),
    )}
    ${highlightBox(`<strong>Next steps:</strong> ${escapeHtml(nextSteps)}`)}
    ${notes}
    <p style="margin:16px 0 0 0;">If you have questions, contact us using the details below.</p>
    ${closingHtml(escapeHtml(config.clinicName))}
  `.trim();

  const textBody = [
    `Hello ${sanitizeText(data.patientName)},`,
    "",
    "We received your appointment booking request. Your appointment is not confirmed yet.",
    "",
    appointmentTextBlock(data.appointment, {
      doctorName: data.doctorName,
      bookingReference: data.bookingReference,
    }),
    `Status: ${sanitizeText(bookingStatus)}`,
    paymentStatus ? `Payment: ${sanitizeText(paymentStatus)}` : "",
    "",
    `Next steps: ${sanitizeText(nextSteps)}`,
    data.notes?.trim() ? `\nNotes: ${sanitizeText(data.notes.trim())}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return await renderWithLayout(
    {
      title: "Booking received",
      preheader: "We received your appointment request — not confirmed yet.",
      htmlBody,
      textBody,
    },
    `Booking received — ${data.bookingReference}`,
    config,
  );
}
