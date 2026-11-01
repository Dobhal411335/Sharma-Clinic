import { getClinicConfig } from "../../config";
import type { AdminNewBookingEmailData, RenderedEmail } from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { detailRow, detailsTable, primaryButton } from "../shared/layout";
import {
  appointmentRows,
  appointmentTextBlock,
} from "../appointment/_shared";

export function renderNewBookingAdminEmail(
  data: AdminNewBookingEmailData,
): RenderedEmail {
  const config = getClinicConfig();
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
        detailRow("Doctor", escapeHtml(data.doctorName)),
        appointmentRows(data.appointment, {
          bookingReference: data.bookingReference,
        }),
      ].join("\n"),
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
    `Doctor: ${sanitizeText(data.doctorName)}`,
    appointmentTextBlock(data.appointment, {
      bookingReference: data.bookingReference,
    }),
    data.dashboardUrl ? `\nReview: ${data.dashboardUrl}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return renderWithLayout(
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
