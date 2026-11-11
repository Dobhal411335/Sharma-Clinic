import { getClinicConfig } from "../../config";
import type { AppointmentCancelledEmailData, RenderedEmail } from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { detailsTable, highlightBox, primaryButton } from "../shared/layout";
import { appointmentRows, appointmentTextBlock } from "./_shared";

export async function renderAppointmentCancelledEmail(
  data: AppointmentCancelledEmailData,
): Promise<RenderedEmail> {
  const config = await getClinicConfig();
  const patientName = escapeHtml(data.patientName);
  const reason = data.cancellationReason?.trim()
    ? highlightBox(
        `<strong>Cancellation details:</strong> ${escapeHtml(data.cancellationReason.trim())}`,
      )
    : "";
  const refund = data.refundInfo?.trim()
    ? highlightBox(
        `<strong>Refund:</strong> ${escapeHtml(data.refundInfo.trim())}`,
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
    ${refund}
    <p style="margin:12px 0 0 0;">If you need assistance, contact the clinic using the details below.</p>
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
      ? `\nCancellation details: ${sanitizeText(data.cancellationReason.trim())}`
      : "",
    data.refundInfo?.trim()
      ? `\nRefund: ${sanitizeText(data.refundInfo.trim())}`
      : "",
    "",
    "If you need assistance, contact the clinic using the details below.",
    data.rebookUrl ? `\nBook again: ${data.rebookUrl}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return await renderWithLayout(
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
