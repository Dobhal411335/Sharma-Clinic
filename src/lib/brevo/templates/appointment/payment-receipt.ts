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

export function renderPaymentReceiptEmail(
  data: PaymentReceiptEmailData,
): RenderedEmail {
  const config = getClinicConfig();
  const patientName = escapeHtml(data.patientName);
  const amountLabel = formatInrFromPaise(data.amount.amountPaise);
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
        detailRow("Payment reference", escapeHtml(data.paymentReference)),
        detailRow("Booking reference", escapeHtml(data.bookingReference)),
        detailRow("Doctor", escapeHtml(data.doctorName)),
        detailRow("Paid at", escapeHtml(data.paidAtLabel)),
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
    `Payment reference: ${sanitizeText(data.paymentReference)}`,
    `Booking reference: ${sanitizeText(data.bookingReference)}`,
    `Doctor: ${sanitizeText(data.doctorName)}`,
    `Paid at: ${sanitizeText(data.paidAtLabel)}`,
    data.appointment
      ? `\n${appointmentTextBlock(data.appointment)}`
      : "",
    data.receiptUrl ? `\nView receipt: ${data.receiptUrl}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return renderWithLayout(
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
