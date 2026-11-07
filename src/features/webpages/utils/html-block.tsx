import { isFilledText } from "@/features/webpages/utils/is-filled-text";

type HtmlBlockProps = {
  html?: string | null;
  className?: string;
};

/**
 * Renders TipTap / CMS HTML with shared rich-text styles
 * (`.admin-rich-html` + `.rich-html` from globals.css).
 */
export function HtmlBlock({ html, className = "" }: HtmlBlockProps) {
  if (!isFilledText(html)) return null;

  return (
    <div
      className={`admin-rich-html rich-html ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
