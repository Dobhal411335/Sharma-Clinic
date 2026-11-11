import { getClinicConfig } from "../../config";
import type { PaymentReceiptEmailData, RenderedEmail } from "../../types";
import {
  escapeHtml,
  formatInrFromPaise,
  sanitizeText,
} from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { detailRow, detailsTable, primaryButton } from "../shared/layout";
import { appointmentTextBlock } from "./_shared";

export async function renderPaymentReceiptEmail(
  data: PaymentReceiptEmailData,
): Promise<RenderedEmail> {
  const config = await getClinicConfig();
  const patientName = escapeHtml(data.patientName);
  const amountLabel = formatInrFromPaise(data.amount.amountPaise);
  const paymentStatus = data.paymentStatus?.trim() || "Paid";
  const button = data.receiptUrl
    ? primaryButton("View receipt", data.receiptUrl)
    : "";

  const appointmentRowsHtml = data.appointment
    ? [
        detailRow("Appointment", escapeHtml(data.appointment.startsAtLabel)),
        data.appointment.timezoneLabel
          ? detailRow("Timezone", escapeHtml(data.appointment.timezoneLabel))
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const htmlBody = `
    ${greetingHtml(patientName)}
    <p style="margin:0 0 12px 0;">We received your payment. This email is your receipt for the transaction.</p>
    ${detailsTable(
      [
        detailRow("Amount paid", `<strong>${escapeHtml(amountLabel)}</strong>`),
        detailRow("Payment status", escapeHtml(paymentStatus)),
        detailRow("Payment reference", escapeHtml(data.paymentReference)),
        detailRow("Appointment reference", escapeHtml(data.bookingReference)),
        detailRow("Doctor", escapeHtml(data.doctorName)),
        detailRow("Payment date", escapeHtml(data.paidAtLabel)),
        appointmentRowsHtml,
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
    "We received your payment. This email is your receipt for the transaction.",
    "",
    `Amount paid: ${amountLabel}`,
    `Payment status: ${sanitizeText(paymentStatus)}`,
    `Payment reference: ${sanitizeText(data.paymentReference)}`,
    `Appointment reference: ${sanitizeText(data.bookingReference)}`,
    `Doctor: ${sanitizeText(data.doctorName)}`,
    `Payment date: ${sanitizeText(data.paidAtLabel)}`,
    data.appointment ? `\n${appointmentTextBlock(data.appointment)}` : "",
    data.receiptUrl ? `\nView receipt: ${data.receiptUrl}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return await renderWithLayout(
    {
      title: "Payment receipt",
      preheader: `Payment of ${amountLabel} received.`,
      htmlBody,
      textBody,
    },
    `Payment receipt — ${data.paymentReference}`,
    config,
  );
}
