"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAdminRichTextExtensions } from "@/lib/tiptap/extensions";
import { cn } from "@/lib/utils";
import { showError } from "@/lib/toast";

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px"] as const;

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeightClassName?: string;
  /** When provided, toolbar image button uploads a file and inserts the returned URL. */
  onUploadImage?: (file: File) => Promise<string>;
  disabled?: boolean;
};

function ToolbarButton({
  active,
  disabled,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? "secondary" : "ghost"}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className="shrink-0"
    >
      {children}
    </Button>
  );
}

function normalizeHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content…",
  className,
  minHeightClassName = "min-h-[160px]",
  onUploadImage,
  disabled = false,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastEmittedHtml = useRef(value);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: createAdminRichTextExtensions(placeholder),
    content: value || "",
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          "tiptap-content focus:outline-none",
          minHeightClassName,
          "px-3 py-2",
        ),
      },
    },
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML();
      lastEmittedHtml.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const next = value || "";
    if (next === lastEmittedHtml.current) return;
    if (next === editor.getHTML()) return;
    lastEmittedHtml.current = next;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  const openLinkDialog = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    setLinkUrl(previous || "");
    setLinkDialogOpen(true);
  };

  const applyLink = () => {
    if (!editor) return;
    const href = normalizeHref(linkUrl);
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkDialogOpen(false);
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href })
      .run();
    setLinkDialogOpen(false);
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkDialogOpen(false);
  };

  const handleImageFile = async (file: File | undefined) => {
    if (!file || !editor) return;
    if (!onUploadImage) {
      showError("Image upload is not available for this field");
      return;
    }
    try {
      const url = await onUploadImage(file);
      if (!url.trim()) {
        showError("Upload did not return an image URL");
        return;
      }
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    }
  };

  if (!editor) {
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-background",
          minHeightClassName,
          className,
        )}
      />
    );
  }

  const currentFontSize =
    (editor.getAttributes("textStyle").fontSize as string | undefined) ||
    "default";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-background",
        disabled && "opacity-60",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 p-1.5">
        <ToolbarButton
          label="Undo"
          disabled={disabled || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={disabled || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-3.5 w-3.5" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden />

        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor.isActive("underline")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Inline code"
          active={editor.isActive("code")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-3.5 w-3.5" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden />

        <ToolbarButton
          label="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden />

        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Blockquote"
          active={editor.isActive("blockquote")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-3.5 w-3.5" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden />

        <ToolbarButton
          label="Add link"
          active={editor.isActive("link")}
          disabled={disabled}
          onClick={openLinkDialog}
        >
          <Link2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Remove link"
          disabled={disabled || !editor.isActive("link")}
          onClick={() =>
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
        >
          <Unlink className="h-3.5 w-3.5" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden />

        <ToolbarButton
          label="Align left"
          active={editor.isActive({ textAlign: "left" })}
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Align center"
          active={editor.isActive({ textAlign: "center" })}
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Align right"
          active={editor.isActive({ textAlign: "right" })}
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden />

        <div className="w-[104px]">
          <Select
            value={currentFontSize}
            disabled={disabled}
            onValueChange={(size) => {
              if (!size || size === "default") {
                editor.chain().focus().unsetFontSize().run();
                return;
              }
              editor.chain().focus().setFontSize(size).run();
            }}
          >
            <SelectTrigger size="sm" aria-label="Font size" className="h-7">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              {FONT_SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ToolbarButton
          label="Insert table"
          disabled={disabled}
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <Table2 className="h-3.5 w-3.5" />
        </ToolbarButton>

        {onUploadImage ? (
          <>
            <ToolbarButton
              label="Insert image"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-3.5 w-3.5" />
            </ToolbarButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                void handleImageFile(file);
                event.target.value = "";
              }}
            />
          </>
        ) : null}
      </div>

      <EditorContent editor={editor} />

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add link</DialogTitle>
            <DialogDescription>
              Select text in the editor, then enter a URL to turn it into a
              hyperlink.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="tiptap-link-url">URL</Label>
            <Input
              id="tiptap-link-url"
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            {editor.isActive("link") ? (
              <Button type="button" variant="outline" onClick={removeLink}>
                Remove link
              </Button>
            ) : null}
            <Button type="button" onClick={applyLink}>
              Apply link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
