"use client";

import { ImageIcon, Loader2, Pencil, Trash2, Type, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GalleryItemDto, GalleryPendingUpload } from "@/types/admin/gallery";

type GalleryItemsGridProps = {
  items: GalleryItemDto[];
  pendingUploads?: GalleryPendingUpload[];
  pendingDeleteId: string | null;
  isDeleting: boolean;
  onEdit: (item: GalleryItemDto) => void;
  onRequestDelete: (item: GalleryItemDto) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (item: GalleryItemDto) => void;
  onToggleActive: (item: GalleryItemDto) => void;
};

function TypeBadge({ mediaType }: { mediaType: GalleryItemDto["mediaType"] }) {
  if (mediaType === "video") {
    return (
      <span className="inline-flex items-center gap-1 text-foreground">
        <Video className="size-3" /> Video
      </span>
    );
  }
  if (mediaType === "text_card") {
    return (
      <span className="inline-flex items-center gap-1 text-foreground">
        <Type className="size-3" /> Text
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-foreground">
      <ImageIcon className="size-3" /> Image
    </span>
  );
}

export function GalleryItemsGrid({
  items,
  pendingUploads = [],
  pendingDeleteId,
  isDeleting,
  onEdit,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  onToggleActive,
}: GalleryItemsGridProps) {
  const isEmpty = items.length === 0 && pendingUploads.length === 0;

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border/70 pb-5">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">Gallery Items</CardTitle>
        </div>
        <CardDescription>
          Toggle visibility, edit click URLs or text cards, or remove lookbook items.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isEmpty ? (
          <p className="text-sm text-muted-foreground">
            No gallery media uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pendingUploads.map((pending) => (
              <div
                key={pending.id}
                className="group relative overflow-hidden rounded-xl border border-dashed border-border bg-muted/20"
                aria-busy="true"
                aria-label={`Uploading ${pending.fileName}`}
              >
                <div className="relative aspect-video overflow-hidden bg-muted/40">
                  {pending.mediaType === "video" ? (
                    <video
                      src={pending.previewUrl}
                      className="h-full w-full object-cover opacity-60"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- local object-URL upload preview
                    <img
                      src={pending.previewUrl}
                      alt={`Uploading ${pending.fileName}`}
                      className="h-full w-full object-cover opacity-60"
                    />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/55 backdrop-blur-[1px]">
                    <Loader2
                      className="size-8 animate-spin text-foreground"
                      aria-hidden
                    />
                    <p className="text-xs font-medium text-foreground">
                      Uploading…
                    </p>
                  </div>
                  <div className="absolute left-2 top-2 flex gap-1">
                    <Badge variant="secondary" className="bg-background/90">
                      <TypeBadge mediaType={pending.mediaType} />
                    </Badge>
                    <Badge variant="secondary" className="bg-amber-50 text-amber-800">
                      Uploading
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1 p-3">
                  <p className="truncate text-sm font-medium">{pending.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    Waiting for Cloudinary…
                  </p>
                </div>
              </div>
            ))}

            {items.map((item, index) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-xl border border-border bg-muted/20"
              >
                <div className="relative aspect-video overflow-hidden bg-muted/40">
                  {item.mediaType === "text_card" ? (
                    <div className="flex h-full flex-col justify-between bg-[#d8dde3] p-4">
                      <div>
                        <p className="font-semibold tracking-tight text-foreground">
                          {item.heading || "Text card"}
                        </p>
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      {item.buttonLabel ? (
                        <p className="mt-3 text-xs font-medium underline underline-offset-2">
                          {item.buttonLabel}
                        </p>
                      ) : null}
                    </div>
                  ) : item.mediaType === "video" ? (
                    <video
                      src={item.mediaUrl}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary thumbnails
                    <img
                      src={item.mediaUrl}
                      alt={`Gallery item ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute left-2 top-2 flex gap-1">
                    <Badge variant="secondary" className="bg-background/90">
                      <TypeBadge mediaType={item.mediaType} />
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={
                        item.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {item.active ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 p-3">
                  <div>
                    <p className="truncate text-sm font-medium">
                      {item.mediaType === "text_card"
                        ? item.heading || `Item #${index + 1}`
                        : `Item #${index + 1}`}
                    </p>
                    {item.mediaType !== "text_card" && item.clickUrl ? (
                      <p className="truncate text-xs text-muted-foreground">
                        Link: {item.clickUrl}
                      </p>
                    ) : null}
                    {item.mediaType === "text_card" && item.buttonUrl ? (
                      <p className="truncate text-xs text-muted-foreground">
                        Button: {item.buttonUrl}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleActive(item)}
                    >
                      {item.active ? "Hide" : "Show"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(item)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    {pendingDeleteId === item.id ? (
                      <div className="flex w-full flex-col gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                          Remove this item permanently?
                        </p>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isDeleting}
                            onClick={onCancelDelete}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => onConfirmDelete(item)}
                          >
                            {isDeleting ? "Deleting…" : "Confirm delete"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => onRequestDelete(item)}
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
