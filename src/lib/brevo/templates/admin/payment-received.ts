import { getClinicConfig } from "../../config";
import type { AdminPaymentReceivedEmailData, RenderedEmail } from "../../types";
import {
  escapeHtml,
  formatInrFromPaise,
  sanitizeText,
} from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { detailRow, detailsTable, primaryButton } from "../shared/layout";

export function renderPaymentReceivedAdminEmail(
  data: AdminPaymentReceivedEmailData,
): RenderedEmail {
  const config = getClinicConfig();
  const adminName = escapeHtml(data.adminName?.trim() || "Admin");
  const amountLabel = formatInrFromPaise(data.amount.amountPaise);
  const button = data.dashboardUrl
    ? primaryButton("View payment", data.dashboardUrl)
    : "";

  const htmlBody = `
    ${greetingHtml(adminName)}
    <p style="margin:0 0 12px 0;">A patient payment was <strong>received</strong> and verified.</p>
    ${detailsTable(
      [
        detailRow("Amount", `<strong>${escapeHtml(amountLabel)}</strong>`),
        detailRow("Payment reference", escapeHtml(data.paymentReference)),
        detailRow("Booking reference", escapeHtml(data.bookingReference)),
        detailRow("Patient", escapeHtml(data.patientName)),
        detailRow("Doctor", escapeHtml(data.doctorName)),
        detailRow("Paid at", escapeHtml(data.paidAtLabel)),
      ].join("\n"),
    )}
    ${button}
    ${closingHtml(escapeHtml(config.clinicName))}
  `.trim();

  const textBody = [
    `Hello ${sanitizeText(data.adminName?.trim() || "Admin")},`,
    "",
    "A patient payment was received and verified.",
    "",
    `Amount: ${amountLabel}`,
    `Payment reference: ${sanitizeText(data.paymentReference)}`,
    `Booking reference: ${sanitizeText(data.bookingReference)}`,
    `Patient: ${sanitizeText(data.patientName)}`,
    `Doctor: ${sanitizeText(data.doctorName)}`,
    `Paid at: ${sanitizeText(data.paidAtLabel)}`,
    data.dashboardUrl ? `\nView payment: ${data.dashboardUrl}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return renderWithLayout(
    {
      title: "Payment received",
      preheader: `Payment ${amountLabel} received.`,
      htmlBody,
      textBody,
    },
    `Payment received — ${data.paymentReference}`,
    config,
  );
}
