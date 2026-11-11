import type { BrevoClinicConfig } from "../../config";
import { EMAIL_THEME } from "../../theme";
import { escapeHtml } from "../../utils/html";

export function renderEmailFooter(config: BrevoClinicConfig): string {
  const year = new Date().getUTCFullYear();
  const clinicName = escapeHtml(config.clinicName);
  const address = config.clinicAddress
    ? `<p style="margin:0 0 4px 0;">${escapeHtml(config.clinicAddress)}</p>`
    : "";
  const phone = config.clinicPhone
    ? `<p style="margin:0 0 4px 0;">Phone: ${escapeHtml(config.clinicPhone)}</p>`
    : "";
  const email = config.clinicEmail
    ? `<p style="margin:0 0 4px 0;">Email: <a href="mailto:${escapeHtml(config.clinicEmail)}" style="color:${EMAIL_THEME.primary};text-decoration:none;">${escapeHtml(config.clinicEmail)}</a></p>`
    : "";
  const website = `<p style="margin:0 0 4px 0;">Website: <a href="${escapeHtml(config.appUrl)}" style="color:${EMAIL_THEME.primary};text-decoration:none;">${escapeHtml(config.appUrl)}</a></p>`;

  return `
  <tr>
    <td style="padding:24px;background-color:${EMAIL_THEME.background};border-top:1px solid ${EMAIL_THEME.border};">
      <p style="margin:0 0 12px 0;font-family:${EMAIL_THEME.fontFamily};font-size:14px;font-weight:700;color:${EMAIL_THEME.text};">
        ${clinicName}
      </p>
      <div style="font-family:${EMAIL_THEME.fontFamily};font-size:12px;line-height:1.6;color:${EMAIL_THEME.muted};">
        ${address}
        ${phone}
        ${email}
        ${website}
      </div>
      <p style="margin:16px 0 0 0;font-family:${EMAIL_THEME.fontFamily};font-size:12px;line-height:1.5;color:${EMAIL_THEME.muted};">
        This message was sent regarding your care at ${clinicName}. If you did not expect this email, you can safely ignore it.
      </p>
      <p style="margin:12px 0 0 0;font-family:${EMAIL_THEME.fontFamily};font-size:11px;line-height:1.4;color:${EMAIL_THEME.muted};">
        &copy; ${year} ${clinicName}. All rights reserved.
      </p>
    </td>
  </tr>`.trim();
}

export function renderEmailFooterText(config: BrevoClinicConfig): string {
  const year = new Date().getUTCFullYear();
  const lines = [
    "-".repeat(40),
    config.clinicName,
    config.clinicAddress || undefined,
    config.clinicPhone ? `Phone: ${config.clinicPhone}` : undefined,
    config.clinicEmail ? `Email: ${config.clinicEmail}` : undefined,
    `Website: ${config.appUrl}`,
    "",
    `This message was sent regarding your care at ${config.clinicName}. If you did not expect this email, you can safely ignore it.`,
    `© ${year} ${config.clinicName}. All rights reserved.`,
  ];

  return lines.filter((line) => line !== undefined).join("\n");
}
