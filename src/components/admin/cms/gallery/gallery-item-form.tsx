"use client";

import { useRef, useState } from "react";
import { LayoutTemplate, Loader2, UploadCloud, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { showError, showSuccess } from "@/lib/toast";
import type { GalleryItemFormErrors } from "@/schemas/gallery-schema";
import {
  uploadGalleryImage,
  uploadGalleryVideo,
} from "@/services/api/gallery";
import { ApiError } from "@/services/api/errors";
import type { GalleryItemFormValues, GalleryMediaType } from "@/types/admin/gallery";

type GalleryItemFormProps = {
  
  values: GalleryItemFormValues;
  errors: GalleryItemFormErrors;
  isSubmitting: boolean;
  isEditing: boolean;
  editingId: string | null;
  onChange: (values: GalleryItemFormValues) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

function detectMediaType(file: File): Exclude<GalleryMediaType, "text_card"> | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  const name = file.name.toLowerCase();
  if (/\.(jpe?g|png|webp)$/.test(name)) return "image";
  if (/\.(mp4|webm|mov)$/.test(name)) return "video";
  return null;
}

export function GalleryItemForm({
  values,
  errors,
  isSubmitting,
  isEditing,
  editingId,
  onChange,
  onSubmit,
  onReset,
}: GalleryItemFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const isTextCard = values.mediaType === "text_card";

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const mediaType = detectMediaType(file);
    if (!mediaType) {
      showError("Unsupported file type");
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const uploaded =
        mediaType === "video"
          ? await uploadGalleryVideo(file, editingId)
          : await uploadGalleryImage(file, editingId);
      onChange({
        ...values,
        mediaType,
        mediaUrl: uploaded.url,
        mediaPublicId: uploaded.publicId,
        heading: "",
        description: "",
        buttonLabel: "",
        buttonUrl: "",
      });
      showSuccess(mediaType === "video" ? "Video uploaded" : "Image uploaded");
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Media upload failed",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border/70 pb-5">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">
            {isEditing ? "Edit Gallery Item" : "Edit Selected Item"}
          </CardTitle>
        </div>
        <CardDescription>
          Update media click URLs, text cards, or visibility. Use the upload panel
          above to add many files at once.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {isTextCard ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gallery-heading">
                    Heading <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="gallery-heading"
                    value={values.heading}
                    disabled={!isEditing}
                    onChange={(event) =>
                      onChange({ ...values, heading: event.target.value })
                    }
                    placeholder="HÄLLAN"
                  />
                  {errors.heading ? (
                    <p className="text-sm text-destructive">{errors.heading}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gallery-description">
                    Sub description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="gallery-description"
                    value={values.description}
                    disabled={!isEditing}
                    rows={4}
                    onChange={(event) =>
                      onChange({ ...values, description: event.target.value })
                    }
                    placeholder="Short supporting line for the lookbook card"
                  />
                  {errors.description ? (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gallery-button-label">
                    Button label <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="gallery-button-label"
                    value={values.buttonLabel}
                    disabled={!isEditing}
                    onChange={(event) =>
                      onChange({ ...values, buttonLabel: event.target.value })
                    }
                    placeholder="Shop now"
                  />
                  {errors.buttonLabel ? (
                    <p className="text-sm text-destructive">{errors.buttonLabel}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gallery-button-url">
                    Button click URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="gallery-button-url"
                    value={values.buttonUrl}
                    disabled={!isEditing}
                    onChange={(event) =>
                      onChange({ ...values, buttonUrl: event.target.value })
                    }
                    placeholder="/category or https://…"
                  />
                  {errors.buttonUrl ? (
                    <p className="text-sm text-destructive">{errors.buttonUrl}</p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  Media preview <span className="text-destructive">*</span>
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov"
                  className="hidden"
                  onChange={(event) => void handleUpload(event)}
                />
                <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted/40">
                  {values.mediaUrl ? (
                    values.mediaType === "video" ? (
                      <video
                        src={values.mediaUrl}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        controls
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary previews
                      <img
                        src={values.mediaUrl}
                        alt="Gallery preview"
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Video className="size-8 opacity-40" />
                      <p className="text-sm">No media selected</p>
                    </div>
                  )}
                </div>
                {errors.mediaUrl ? (
                  <p className="text-sm text-destructive">{errors.mediaUrl}</p>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading || !isEditing}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <UploadCloud className="size-4" />
                  )}
                  Replace media
                </Button>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Item type</Label>
                <Select
                  value={values.mediaType}
                  disabled={!isEditing || !isTextCard}
                  onValueChange={(value) => {
                    if (value !== "text_card") return;
                    onChange({
                      ...values,
                      mediaType: "text_card",
                      mediaUrl: "",
                      mediaPublicId: "",
                      clickUrl: "",
                    });
                  }}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text_card">Text card</SelectItem>
                  </SelectContent>
                </Select>
                {!isTextCard ? (
                  <p className="text-xs text-muted-foreground">
                    Media type follows the uploaded file. Create text cards from the
                    panel above.
                  </p>
                ) : null}
              </div>

              {!isTextCard ? (
                <div className="space-y-2">
                  <Label htmlFor="gallery-click-url">Button click URL</Label>
                  <Input
                    id="gallery-click-url"
                    value={values.clickUrl}
                    disabled={!isEditing}
                    onChange={(event) =>
                      onChange({ ...values, clickUrl: event.target.value })
                    }
                    placeholder="/product/… or https://… (optional)"
                  />
                  {errors.clickUrl ? (
                    <p className="text-sm text-destructive">{errors.clickUrl}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    Optional. When set, the storefront wraps this media in a link.
                  </p>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 max-w-xs">
                <div className="space-y-0.5">
                  <Label htmlFor="gallery-active">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    {values.active ? "Visible on storefront" : "Hidden"}
                  </p>
                </div>
                <Switch
                  id="gallery-active"
                  checked={values.active}
                  disabled={!isEditing}
                  onCheckedChange={(checked) =>
                    onChange({ ...values, active: checked })
                  }
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" disabled={!isEditing || isSubmitting || uploading}>
                  {isSubmitting ? "Saving…" : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!isEditing || isSubmitting}
                  onClick={onReset}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
