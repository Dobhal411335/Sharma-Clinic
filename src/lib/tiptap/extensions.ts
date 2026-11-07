import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "@tiptap/extension-text-style/font-size";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import type { Extensions } from "@tiptap/react";

/** Shared TipTap extension set for admin rich-text fields. */
export function createAdminRichTextExtensions(placeholder?: string): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: {
        class: "tiptap-link",
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
    TextStyle,
    FontSize,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Image.configure({
      allowBase64: false,
      resize: {
        enabled: true,
        directions: [
          "top-left",
          "top-right",
          "bottom-left",
          "bottom-right",
        ],
        minWidth: 48,
        minHeight: 48,
        alwaysPreserveAspectRatio: true,
      },
      HTMLAttributes: {
        class: "tiptap-image",
      },
    }),
    TableKit.configure({
      table: {
        resizable: true,
        handleWidth: 6,
        cellMinWidth: 48,
        lastColumnResizable: true,
        HTMLAttributes: {
          class: "tiptap-table",
        },
      },
    }),
    Placeholder.configure({
      placeholder: placeholder || "Write content…",
    }),
  ];
}

/** Strip tags for compact table / list previews (admin UI only). */
export function stripHtmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function isEmptyRichTextHtml(html: string): boolean {
  if (!html.trim()) return true;
  return stripHtmlToText(html).length === 0 && !/<img\b/i.test(html);
}
