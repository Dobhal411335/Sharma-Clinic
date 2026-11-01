import type { BrevoClinicConfig } from "../../config";
import { EMAIL_THEME } from "../../theme";
import { escapeHtml } from "../../utils/html";

export function renderEmailHeader(config: BrevoClinicConfig): string {
  const clinicName = escapeHtml(config.clinicName);
  const logo = config.logoUrl
    ? `<img src="${escapeHtml(config.logoUrl)}" alt="${clinicName} logo" width="48" height="48" style="display:block;border:0;border-radius:8px;margin:0 auto 12px auto;" />`
    : `<div style="width:48px;height:48px;margin:0 auto 12px auto;border-radius:8px;background-color:${EMAIL_THEME.accent};color:${EMAIL_THEME.secondary};font-family:${EMAIL_THEME.fontFamily};font-size:20px;font-weight:700;line-height:48px;text-align:center;">SC</div>`;

  return `
  <tr>
    <td align="center" style="padding:28px 24px 20px 24px;background-color:${EMAIL_THEME.primary};">
      ${logo}
      <p style="margin:0;font-family:${EMAIL_THEME.fontFamily};font-size:22px;font-weight:700;line-height:1.3;color:${EMAIL_THEME.secondary};">
        ${clinicName}
      </p>
      <p style="margin:8px 0 0 0;font-family:${EMAIL_THEME.fontFamily};font-size:13px;line-height:1.4;color:#D6EAF8;">
        Patient care notifications
      </p>
    </td>
  </tr>`.trim();
}

export function renderEmailHeaderText(config: BrevoClinicConfig): string {
  return `${config.clinicName}\nPatient care notifications\n${"=".repeat(40)}`;
}
