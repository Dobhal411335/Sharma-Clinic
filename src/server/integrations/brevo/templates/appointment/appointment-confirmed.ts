import { getClinicConfig } from "../../config";
import type { AppointmentConfirmedEmailData, RenderedEmail } from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { detailRow, detailsTable, highlightBox, primaryButton } from "../shared/layout";
import { appointmentRows, appointmentTextBlock } from "./_shared";

export async function renderAppointmentConfirmedEmail(
  data: AppointmentConfirmedEmailData,
): Promise<RenderedEmail> {
  const config = await getClinicConfig();
  const patientName = escapeHtml(data.patientName);
  const location =
    data.locationLabel?.trim() || config.clinicAddress || undefined;
  const paymentInfo = data.paymentInfo?.trim()
    ? highlightBox(
        `<strong>Payment:</strong> ${escapeHtml(data.paymentInfo.trim())}`,
      )
    : "";
  const visitInstructions =
    data.visitInstructions?.trim() ||
    "Please arrive a few minutes early and bring a valid ID. Contact the clinic if you need to reschedule.";
  const button = data.manageUrl
    ? primaryButton("View appointment details", data.manageUrl)
    : "";

  const htmlBody = `
    ${greetingHtml(patientName)}
    <p style="margin:0 0 12px 0;">Your appointment has been <strong>confirmed</strong>.</p>
    ${detailsTable(
      [
        appointmentRows(data.appointment, {
          doctorName: data.doctorName,
          bookingReference: data.bookingReference,
          locationLabel: location,
        }),
        config.clinicAddress
          ? detailRow("Clinic address", escapeHtml(config.clinicAddress))
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    )}
    ${paymentInfo}
    ${highlightBox(`<strong>Visit instructions:</strong> ${escapeHtml(visitInstructions)}`)}
    ${button}
    ${closingHtml(escapeHtml(config.clinicName))}
  `.trim();

  const textBody = [
    `Hello ${sanitizeText(data.patientName)},`,
    "",
    "Your appointment has been confirmed.",
    "",
    appointmentTextBlock(data.appointment, {
      doctorName: data.doctorName,
      bookingReference: data.bookingReference,
      locationLabel: location,
    }),
    config.clinicAddress
      ? `Clinic address: ${sanitizeText(config.clinicAddress)}`
      : "",
    data.paymentInfo?.trim()
      ? `Payment: ${sanitizeText(data.paymentInfo.trim())}`
      : "",
    "",
    `Visit instructions: ${sanitizeText(visitInstructions)}`,
    data.manageUrl ? `\nView details: ${data.manageUrl}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return await renderWithLayout(
    {
      title: "Appointment confirmed",
      preheader: `Confirmed with ${data.doctorName} on ${data.appointment.startsAtLabel}.`,
      htmlBody,
      textBody,
    },
    `Appointment confirmed — ${data.bookingReference}`,
    config,
  );
}
