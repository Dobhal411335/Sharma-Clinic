"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeightClassName?: string;
  onUploadImage?: (file: File) => Promise<string>;
  disabled?: boolean;
};

/** HTML content field. Stores the same HTML string the public pages already render. */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content…",
  className,
  minHeightClassName = "min-h-[160px]",
  disabled = false,
}: RichTextEditorProps) {
  return (
    <Textarea
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={cn(minHeightClassName, "font-mono text-sm", className)}
    />
  );
}
