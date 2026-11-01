/**
 * Inline email theme tokens — healthcare blue / white / subtle teal.
 * Kept server-side inside the Brevo module only.
 */
export const EMAIL_THEME = {
  primary: "#1B4F72",
  primaryDark: "#154360",
  secondary: "#FFFFFF",
  accent: "#148F77",
  accentSoft: "#E8F6F3",
  text: "#1C2833",
  muted: "#5D6D7E",
  border: "#D5D8DC",
  background: "#EEF2F5",
  card: "#FFFFFF",
  success: "#1E8449",
  warning: "#B9770E",
  danger: "#922B21",
  fontFamily:
    "Segoe UI, Tahoma, Geneva, Verdana, Arial, Helvetica, sans-serif",
} as const;

export type EmailTheme = typeof EMAIL_THEME;
