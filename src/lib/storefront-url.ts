/** Public site origin for admin "view page" links. Empty string keeps the link relative. */
export function storefrontBaseUrl(_siteCode?: "IN" | "COM"): string {
  const value = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  return value.replace(/\/$/, "");
}
