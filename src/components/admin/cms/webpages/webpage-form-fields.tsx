"use client";

import { useRef, useState, type ReactNode } from "react";
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";

import { RichTextEditor } from "@/components/admin/cms/editor/rich-text-editor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { showError, showSuccess } from "@/lib/toast";
import { ApiError } from "@/services/api/errors";
import { uploadWebpageImage } from "@/services/api/webpages";
import type { WebpageImageAsset } from "@/types/admin/webpages";
import { emptyImage } from "@/components/admin/cms/webpages/webpage-form-state";

export type WebpageFormFieldsProps = {
  
  webpageId: string;
};

export function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border/70">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">{children}</CardContent>
    </Card>
  );
}

export function ImageAssetField({
  webpageId,
  label,
  hint,
  value,
  onChange,
  inputId,
}: WebpageFormFieldsProps & {
  label: string;
  hint?: string;
  value: WebpageImageAsset;
  onChange: (next: WebpageImageAsset) => void;
  inputId: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadWebpageImage(file, webpageId);
      onChange({ url: uploaded.url, key: uploaded.key });
      showSuccess("Image uploaded successfully");
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Image upload failed",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-6 text-center">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <div className="mb-3 rounded-full border border-border bg-muted p-2.5 text-muted-foreground">
          <ImageIcon className="size-5" aria-hidden />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Choose image"}
        </Button>
        {hint ? (
          <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
        ) : null}
        {value?.url ? (
          <div className="relative mt-4 h-44 w-full max-w-md overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.url}
              alt={`${label} preview`}
              className="h-full w-full object-cover"
            />
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              className="absolute top-2 right-2 border-rose-200 bg-white/95 text-rose-600 hover:bg-rose-50"
              onClick={() => onChange(emptyImage())}
              title="Remove image"
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function StringListField({
  label,
  values,
  onChange,
  placeholder = "Add item…",
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={value}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...values];
                next[index] = e.target.value;
                onChange(next);
              }}
            />
            <Button
              type="button"
              size="icon"
              onClick={() => onChange([...values, ""])}
            >
              <Plus className="size-4" aria-hidden />
            </Button>
            {values.length > 1 ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
                onClick={() => onChange(values.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SeoKeywordsField({
  titleLine,
  keywords,
  onTitleLineChange,
  onKeywordsChange,
}: {
  titleLine: string;
  keywords: string[];
  onTitleLineChange: (value: string) => void;
  onKeywordsChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
      <div className="space-y-2">
        <Label htmlFor="webpage-title-line">SEO title line</Label>
        <Input
          id="webpage-title-line"
          value={titleLine}
          onChange={(e) => onTitleLineChange(e.target.value)}
          placeholder="Browser / SEO title line"
        />
      </div>
      <StringListField
        label="SEO keywords"
        values={keywords}
        onChange={onKeywordsChange}
        placeholder="Keyword…"
      />
    </div>
  );
}

export function PostedByField({
  admin,
  user,
  onChange,
}: {
  admin: boolean;
  user: boolean;
  onChange: (next: { admin: boolean; user: boolean }) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Posted by role</Label>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Checkbox
            checked={admin}
            onCheckedChange={(checked) =>
              onChange({ admin: checked === true, user })
            }
          />
          Admin
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <Checkbox
            checked={user}
            onCheckedChange={(checked) =>
              onChange({ admin, user: checked === true })
            }
          />
          User
        </label>
      </div>
    </div>
  );
}

export function RichHtmlField({
  label,
  value,
  onChange,
  onUploadImage,
}: {
  label: string;
  value: string;
  onChange: (html: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <RichTextEditor
        value={value}
        onChange={onChange}
        onUploadImage={onUploadImage}
        minHeightClassName="min-h-[140px]"
      />
    </div>
  );
}

export { Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, Checkbox };
