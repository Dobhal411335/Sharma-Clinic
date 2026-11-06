"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Type, Upload, Video } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { showError, showSuccess } from "@/lib/toast";
import {
  createGalleryItem,
  uploadGalleryImage,
  uploadGalleryVideo,
} from "@/services/api/gallery";
import { ApiError } from "@/services/api/errors";
import type { GalleryMediaType, GalleryPendingUpload } from "@/types/admin/gallery";

type GalleryUploadPanelProps = {
  
  onQueuePending: (pending: GalleryPendingUpload[]) => void;
  onPendingComplete: (id: string) => void;
  onUploaded: () => Promise<void>;
};

type TextCardDraft = {
  heading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
};

const emptyTextCard = (): TextCardDraft => ({
  heading: "",
  description: "",
  buttonLabel: "",
  buttonUrl: "",
});

function detectMediaType(
  file: File,
): Exclude<GalleryMediaType, "text_card"> | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  const name = file.name.toLowerCase();
  if (/\.(jpe?g|png|webp)$/.test(name)) return "image";
  if (/\.(mp4|webm|mov)$/.test(name)) return "video";
  return null;
}

function createPendingId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function GalleryUploadPanel({
  onQueuePending,
  onPendingComplete,
  onUploaded,
}: GalleryUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [creatingTextCard, setCreatingTextCard] = useState(false);
  const [textCard, setTextCard] = useState<TextCardDraft>(emptyTextCard);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const queued: Array<{
      pending: GalleryPendingUpload;
      file: File;
      mediaType: Exclude<GalleryMediaType, "text_card">;
    }> = [];
    let unsupported = 0;

    for (const file of files) {
      const mediaType = detectMediaType(file);
      if (!mediaType) {
        unsupported += 1;
        continue;
      }
      queued.push({
        file,
        mediaType,
        pending: {
          id: createPendingId(),
          fileName: file.name,
          mediaType,
          previewUrl: URL.createObjectURL(file),
        },
      });
    }

    if (queued.length === 0) {
      showError(
        unsupported > 0
          ? "No supported files selected"
          : "No files selected",
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    onQueuePending(queued.map((entry) => entry.pending));
    setUploading(true);
    let created = 0;
    let failed = unsupported;

    try {
      for (const entry of queued) {
        try {
          const uploaded =
            entry.mediaType === "video"
              ? await uploadGalleryVideo(entry.file)
              : await uploadGalleryImage(entry.file);

          await createGalleryItem({
            mediaType: entry.mediaType,
            mediaUrl: uploaded.url,
            mediaPublicId: uploaded.publicId,
            clickUrl: "",
            heading: "",
            description: "",
            buttonLabel: "",
            buttonUrl: "",
            active: true,
          });
          created += 1;
        } catch {
          failed += 1;
        } finally {
          onPendingComplete(entry.pending.id);
        }
      }

      if (created > 0) {
        showSuccess(
          created === 1
            ? "Gallery item uploaded"
            : `${created} gallery items uploaded`,
        );
        await onUploaded();
      }
      if (failed > 0) {
        showError(
          failed === 1
            ? "One file failed to upload"
            : `${failed} files failed to upload`,
        );
      }
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Gallery upload failed",
      );
      for (const entry of queued) {
        onPendingComplete(entry.pending.id);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreateTextCard = async () => {
    const heading = textCard.heading.trim();
    const description = textCard.description.trim();
    const buttonLabel = textCard.buttonLabel.trim();
    const buttonUrl = textCard.buttonUrl.trim();

    if (!heading || !description || !buttonLabel || !buttonUrl) {
      showError("Fill heading, description, button label, and button URL");
      return;
    }

    setCreatingTextCard(true);
    try {
      await createGalleryItem({
        mediaType: "text_card",
        mediaUrl: "",
        mediaPublicId: "",
        clickUrl: "",
        heading,
        description,
        buttonLabel,
        buttonUrl,
        active: true,
      });
      showSuccess("Text card created");
      setTextCard(emptyTextCard());
      await onUploaded();
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Failed to create text card",
      );
    } finally {
      setCreatingTextCard(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border/70 pb-5">
          <div className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">Upload Gallery Media</CardTitle>
          </div>
          <CardDescription>
            Add multiple images and short videos at once. Previews appear in Gallery
            Items while each file uploads.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Images &amp; videos</Label>
            <p className="text-sm text-muted-foreground">
              Images: JPG, PNG, WebP. Videos: MP4, WebM, MOV. Add an optional click
              URL later in Edit.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov"
            multiple
            className="hidden"
            onChange={(event) => void handleUpload(event)}
          />

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {uploading ? "Uploading…" : "Upload media"}
            </Button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ImagePlus className="size-3.5" /> Images
              </span>
              <span className="inline-flex items-center gap-1">
                <Video className="size-3.5" /> Videos
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border/70 pb-5">
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">Add Text Card</CardTitle>
          </div>
          <CardDescription>
            Mix typography cards into the lookbook masonry. No media upload required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-text-heading">Heading</Label>
              <Input
                id="new-text-heading"
                value={textCard.heading}
                onChange={(event) =>
                  setTextCard((prev) => ({ ...prev, heading: event.target.value }))
                }
                placeholder="HÄLLAN"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-text-button-label">Button label</Label>
              <Input
                id="new-text-button-label"
                value={textCard.buttonLabel}
                onChange={(event) =>
                  setTextCard((prev) => ({
                    ...prev,
                    buttonLabel: event.target.value,
                  }))
                }
                placeholder="Shop now"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="new-text-description">Sub description</Label>
              <Textarea
                id="new-text-description"
                value={textCard.description}
                rows={3}
                onChange={(event) =>
                  setTextCard((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Short supporting line"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="new-text-button-url">Button click URL</Label>
              <Input
                id="new-text-button-url"
                value={textCard.buttonUrl}
                onChange={(event) =>
                  setTextCard((prev) => ({
                    ...prev,
                    buttonUrl: event.target.value,
                  }))
                }
                placeholder="/category or https://…"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={() => void handleCreateTextCard()}
            disabled={creatingTextCard || uploading}
          >
            {creatingTextCard ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Type className="size-4" />
            )}
            {creatingTextCard ? "Creating…" : "Create text card"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
