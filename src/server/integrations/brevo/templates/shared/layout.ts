import type { BrevoClinicConfig } from "../../config";
import { EMAIL_THEME } from "../../theme";
import type { EmailBodyContent, RenderedEmail } from "../../types";
import { escapeHtml } from "../../utils/html";
import { renderEmailFooter, renderEmailFooterText } from "./footer";
import { renderEmailHeader, renderEmailHeaderText } from "./header";

/**
 * Wraps every transactional email: header + body + footer.
 * Table-based, inline CSS, no JavaScript.
 */
export function wrapEmailLayout(
  config: BrevoClinicConfig,
  content: EmailBodyContent,
  subject: string,
): RenderedEmail {
  const title = escapeHtml(content.title);
  const preheader = content.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(content.preheader)}</div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${EMAIL_THEME.background};">
  ${preheader}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${EMAIL_THEME.background};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background-color:${EMAIL_THEME.card};border:1px solid ${EMAIL_THEME.border};border-radius:8px;overflow:hidden;">
          ${renderEmailHeader(config)}
          <tr>
            <td style="padding:28px 24px;font-family:${EMAIL_THEME.fontFamily};font-size:15px;line-height:1.6;color:${EMAIL_THEME.text};">
              ${content.htmlBody}
            </td>
          </tr>
          ${renderEmailFooter(config)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    renderEmailHeaderText(config),
    "",
    content.title,
    content.preheader ? content.preheader : undefined,
    "",
    content.textBody,
    "",
    renderEmailFooterText(config),
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  return { subject, html, text };
}

/** Shared detail row for appointment / payment tables. */
export function detailRow(label: string, valueHtml: string): string {
  return `
  <tr>
    <td style="padding:8px 0;font-family:${EMAIL_THEME.fontFamily};font-size:13px;color:${EMAIL_THEME.muted};width:38%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;font-family:${EMAIL_THEME.fontFamily};font-size:14px;color:${EMAIL_THEME.text};vertical-align:top;">${valueHtml}</td>
  </tr>`.trim();
}

export function detailsTable(rowsHtml: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:16px 0;border-collapse:collapse;">
    ${rowsHtml}
  </table>`.trim();
}

export function primaryButton(label: string, href: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px 0;">
    <tr>
      <td style="background-color:${EMAIL_THEME.primary};border-radius:6px;">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 22px;font-family:${EMAIL_THEME.fontFamily};font-size:14px;font-weight:600;color:${EMAIL_THEME.secondary};text-decoration:none;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`.trim();
}

export function highlightBox(htmlInner: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:16px 0;">
    <tr>
      <td style="padding:14px 16px;background-color:${EMAIL_THEME.accentSoft};border-left:4px solid ${EMAIL_THEME.accent};border-radius:4px;font-family:${EMAIL_THEME.fontFamily};font-size:14px;line-height:1.5;color:${EMAIL_THEME.text};">
        ${htmlInner}
      </td>
    </tr>
  </table>`.trim();
}
