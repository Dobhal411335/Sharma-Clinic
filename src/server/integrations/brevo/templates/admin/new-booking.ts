import { getClinicConfig } from "../../config";
import type { AdminNewBookingEmailData, RenderedEmail } from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { detailRow, detailsTable, primaryButton } from "../shared/layout";
import {
  appointmentRows,
  appointmentTextBlock,
} from "../appointment/_shared";

export async function renderNewBookingAdminEmail(
  data: AdminNewBookingEmailData,
): Promise<RenderedEmail> {
  const config = await getClinicConfig();
  const adminName = escapeHtml(data.adminName?.trim() || "Admin");
  const button = data.dashboardUrl
    ? primaryButton("Review booking", data.dashboardUrl)
    : "";

  const htmlBody = `
    ${greetingHtml(adminName)}
    <p style="margin:0 0 12px 0;">A <strong>new booking</strong> was submitted on the public site.</p>
    ${detailsTable(
      [
        detailRow("Patient", escapeHtml(data.patientName)),
        data.patientEmail
          ? detailRow("Patient email", escapeHtml(data.patientEmail))
          : "",
        data.patientPhone
          ? detailRow("Patient phone", escapeHtml(data.patientPhone))
          : "",
        detailRow("Doctor", escapeHtml(data.doctorName)),
        appointmentRows(data.appointment, {
          bookingReference: data.bookingReference,
        }),
        data.bookingStatus
          ? detailRow("Booking status", escapeHtml(data.bookingStatus))
          : "",
        data.paymentStatus
          ? detailRow("Payment status", escapeHtml(data.paymentStatus))
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    )}
    ${button}
    ${closingHtml(escapeHtml(config.clinicName))}
  `.trim();

  const textBody = [
    `Hello ${sanitizeText(data.adminName?.trim() || "Admin")},`,
    "",
    "A new booking was submitted on the public site.",
    "",
    `Patient: ${sanitizeText(data.patientName)}`,
    data.patientEmail
      ? `Patient email: ${sanitizeText(data.patientEmail)}`
      : "",
    data.patientPhone
      ? `Patient phone: ${sanitizeText(data.patientPhone)}`
      : "",
    `Doctor: ${sanitizeText(data.doctorName)}`,
    appointmentTextBlock(data.appointment, {
      bookingReference: data.bookingReference,
    }),
    data.bookingStatus
      ? `Booking status: ${sanitizeText(data.bookingStatus)}`
      : "",
    data.paymentStatus
      ? `Payment status: ${sanitizeText(data.paymentStatus)}`
      : "",
    data.dashboardUrl ? `\nReview: ${data.dashboardUrl}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return await renderWithLayout(
    {
      title: "New booking",
      preheader: `New booking ${data.bookingReference}.`,
      htmlBody,
      textBody,
    },
    `New booking — ${data.bookingReference}`,
    config,
  );
}
