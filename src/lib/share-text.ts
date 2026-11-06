/** Server-safe share / SEO text helpers (no toast or browser APIs). */

export type ShareContentInput = {
  /** Page / product / article title sent to the Web Share API. */
  title: string;
  /** Optional SEO-style description / excerpt. */
  text?: string;
  /** Absolute or path URL. Defaults to the current page. */
  url?: string;
  /** Toast id prefix, e.g. `product.share` → `product.share.copied`. */
  toastId?: string;
  /** Error toast when share / clipboard fails (user abort is ignored). */
  errorMessage?: string;
};

/** Strip HTML and collapse whitespace for share / SEO text. */
export function plainTextForShare(value: string, maxLength = 160): string {
  const text = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
