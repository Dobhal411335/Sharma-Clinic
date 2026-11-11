import { getClinicConfig } from "../../config";
import type {
  RenderedEmail,
  StaffPasswordResetEmailData,
} from "../../types";
import { escapeHtml, sanitizeText } from "../../utils/html";
import { closingHtml, greetingHtml, renderWithLayout } from "../../utils/render-email";
import { highlightBox, primaryButton } from "../shared/layout";

/**
 * Staff password reset — never includes passwords or raw tokens in the body copy.
 * resetUrl must be an opaque absolute URL.
 */
export async function renderStaffPasswordResetEmail(
  data: StaffPasswordResetEmailData,
): Promise<RenderedEmail> {
  const config = await getClinicConfig();
  const recipientName = escapeHtml(data.recipientName);
  const expires = data.expiresAtLabel?.trim()
    ? highlightBox(
        `This reset link expires on <strong>${escapeHtml(data.expiresAtLabel.trim())}</strong>.`,
      )
    : "";

  const htmlBody = `
    ${greetingHtml(recipientName)}
    <p style="margin:0 0 12px 0;">We received a request to reset the password for your staff account at <strong>${escapeHtml(config.clinicName)}</strong>.</p>
    <p style="margin:0 0 12px 0;">Use the secure link below to choose a new password. If you did not request this, you can ignore this email — your current password will remain unchanged.</p>
    ${primaryButton("Reset password", data.resetUrl)}
    <p style="margin:12px 0 0 0;font-size:12px;color:#5D6D7E;word-break:break-all;">If the button does not work, copy and paste this URL into your browser:<br />${escapeHtml(data.resetUrl)}</p>
    ${expires}
    ${closingHtml(escapeHtml(config.clinicName))}
  `.trim();

  const textBody = [
    `Hello ${sanitizeText(data.recipientName)},`,
    "",
    `We received a request to reset the password for your staff account at ${config.clinicName}.`,
    "",
    "Use the secure link below to choose a new password. If you did not request this, you can ignore this email — your current password will remain unchanged.",
    "",
    `Reset password: ${data.resetUrl}`,
    data.expiresAtLabel?.trim()
      ? `\nThis reset link expires on ${sanitizeText(data.expiresAtLabel.trim())}.`
      : "",
    "",
    `Thank you,\n${config.clinicName}`,
  ].join("\n");

  return await renderWithLayout(
    {
      title: "Password reset",
      preheader: "Reset your staff account password.",
      htmlBody,
      textBody,
    },
    `Password reset — ${config.clinicName}`,
    config,
  );
}

/** @deprecated Use renderStaffPasswordResetEmail */
export const renderPasswordResetEmail = renderStaffPasswordResetEmail;
