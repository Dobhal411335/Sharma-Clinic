import { getClinicConfig } from "../../config";
import type { DoctorInvitationEmailData, RenderedEmail } from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { highlightBox, primaryButton } from "../shared/layout";

/**
 * Doctor invitation — never includes plaintext passwords.
 * invitationUrl must be an opaque absolute URL.
 */
export function renderDoctorInvitationEmail(
  data: DoctorInvitationEmailData,
): RenderedEmail {
  const config = getClinicConfig();
  const inviteeName = escapeHtml(data.inviteeName);
  const invitedBy = data.invitedByName?.trim()
    ? escapeHtml(data.invitedByName.trim())
    : escapeHtml(config.clinicName);
  const expires = data.expiresAtLabel?.trim()
    ? highlightBox(
        `This invitation link expires on <strong>${escapeHtml(data.expiresAtLabel.trim())}</strong>.`,
      )
    : "";

  const htmlBody = `
    ${greetingHtml(inviteeName)}
    <p style="margin:0 0 12px 0;">${invitedBy} has invited you to join the <strong>${escapeHtml(config.clinicName)}</strong> staff portal as a doctor.</p>
    <p style="margin:0 0 12px 0;">Use the secure link below to accept the invitation and set your own password. For your security, this email never contains a password.</p>
    ${primaryButton("Accept invitation", data.invitationUrl)}
    <p style="margin:12px 0 0 0;font-size:12px;color:#5D6D7E;word-break:break-all;">If the button does not work, copy and paste this URL into your browser:<br />${escapeHtml(data.invitationUrl)}</p>
    ${expires}
    ${closingHtml(escapeHtml(config.clinicName))}
  `.trim();

  const textBody = [
    `Hello ${sanitizeText(data.inviteeName)},`,
    "",
    `${sanitizeText(data.invitedByName?.trim() || config.clinicName)} has invited you to join the ${config.clinicName} staff portal as a doctor.`,
    "",
    "Use the secure link below to accept the invitation and set your own password. This email never contains a password.",
    "",
    `Accept invitation: ${data.invitationUrl}`,
    data.expiresAtLabel?.trim()
      ? `\nThis invitation link expires on ${sanitizeText(data.expiresAtLabel.trim())}.`
      : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return renderWithLayout(
    {
      title: "Doctor invitation",
      preheader: `You're invited to join ${config.clinicName}.`,
      htmlBody,
      textBody,
    },
    `You're invited to join ${config.clinicName}`,
    config,
  );
}
