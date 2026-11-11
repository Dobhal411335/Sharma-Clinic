/**
 * Inline email theme tokens — healthcare blue / white / subtle teal.
 * Aligned with product CSS tokens (#123d67 / #168b91).
 * Kept server-side inside the Brevo module only.
 */
export const EMAIL_THEME = {
  primary: "#123d67",
  primaryDark: "#0e2f4f",
  secondary: "#FFFFFF",
  accent: "#168b91",
  accentSoft: "#e9f4f5",
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
