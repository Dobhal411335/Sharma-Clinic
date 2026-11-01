import { getClinicConfig, type BrevoClinicConfig } from "../config";
import {
  wrapEmailLayout,
} from "../templates/shared/layout";
import type { EmailBodyContent, RenderedEmail } from "../types";

/**
 * Applies the shared header/body/footer layout to template body content.
 */
export function renderWithLayout(
  content: EmailBodyContent,
  subject: string,
  config: BrevoClinicConfig = getClinicConfig(),
): RenderedEmail {
  return wrapEmailLayout(config, content, subject);
}

export function greetingHtml(name: string): string {
  return `<p style="margin:0 0 16px 0;">Hello ${name},</p>`;
}

export function closingHtml(clinicName: string): string {
  return `<p style="margin:24px 0 0 0;">Thank you,<br /><strong>${clinicName}</strong></p>`;
}
