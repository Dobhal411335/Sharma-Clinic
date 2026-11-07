/** True when a string has visible text after stripping HTML tags. */
export function isFilledText(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.replace(/<[^>]*>/g, "").trim().length > 0
  );
}
