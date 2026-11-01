import { getClinicConfig } from "../../config";
import type { AppointmentReminderEmailData, RenderedEmail } from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { detailsTable, highlightBox, primaryButton } from "../shared/layout";
import { appointmentRows, appointmentTextBlock } from "./_shared";

export function renderAppointmentReminderEmail(
  data: AppointmentReminderEmailData,
): RenderedEmail {
  const config = getClinicConfig();
  const patientName = escapeHtml(data.patientName);
  const button = data.manageUrl
    ? primaryButton("View appointment", data.manageUrl)
    : "";

  const htmlBody = `
    ${greetingHtml(patientName)}
    ${highlightBox(
      `This is a friendly reminder about your upcoming appointment with <strong>${escapeHtml(data.doctorName)}</strong>.`,
    )}
    ${detailsTable(
      appointmentRows(data.appointment, {
        doctorName: data.doctorName,
        bookingReference: data.bookingReference,
        locationLabel: data.locationLabel,
      }),
    )}
    <p style="margin:12px 0 0 0;">If you need to reschedule, please contact the clinic as soon as possible.</p>
    ${button}
    ${closingHtml(escapeHtml(config.clinicName))}
  `.trim();

  const textBody = [
    `Hello ${sanitizeText(data.patientName)},`,
    "",
    `This is a friendly reminder about your upcoming appointment with ${sanitizeText(data.doctorName)}.`,
    "",
    appointmentTextBlock(data.appointment, {
      doctorName: data.doctorName,
      bookingReference: data.bookingReference,
      locationLabel: data.locationLabel,
    }),
    "",
    "If you need to reschedule, please contact the clinic as soon as possible.",
    data.manageUrl ? `\nView appointment: ${data.manageUrl}` : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return renderWithLayout(
    {
      title: "Appointment reminder",
      preheader: `Upcoming appointment on ${data.appointment.startsAtLabel}.`,
      htmlBody,
      textBody,
    },
    `Reminder: appointment on ${data.appointment.startsAtLabel}`,
    config,
  );
}
