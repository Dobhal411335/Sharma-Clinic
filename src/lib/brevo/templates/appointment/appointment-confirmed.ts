import { getClinicConfig } from "../../config";
import type { AppointmentConfirmedEmailData, RenderedEmail } from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { detailsTable, primaryButton } from "../shared/layout";
import { appointmentRows, appointmentTextBlock } from "./_shared";

export function renderAppointmentConfirmedEmail(
  data: AppointmentConfirmedEmailData,
): RenderedEmail {
  const config = getClinicConfig();
  const patientName = escapeHtml(data.patientName);
  const button = data.manageUrl
    ? primaryButton("View appointment details", data.manageUrl)
    : "";

  const htmlBody = `
    ${greetingHtml(patientName)}
    <p style="margin:0 0 12px 0;">Your appointment has been <strong>confirmed</strong>. Please arrive a few minutes early.</p>
    ${detailsTable(
      appointmentRows(data.appointment, {
        doctorName: data.doctorName,
        bookingReference: data.bookingReference,
        locationLabel: data.locationLabel,
      }),
    )}
    ${button}
    ${closingHtml(escapeHtml(config.clinicName))}
  `.trim();

  const textBody = [
    `Hello ${sanitizeText(data.patientName)},`,
    "",
    "Your appointment has been confirmed. Please arrive a few minutes early.",
    "",
    appointmentTextBlock(data.appointment, {
      doctorName: data.doctorName,
      bookingReference: data.bookingReference,
      locationLabel: data.locationLabel,
    }),
    data.manageUrl ? `\nView details: ${data.manageUrl}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return renderWithLayout(
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
