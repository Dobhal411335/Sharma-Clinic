"use client";

import { useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

import {
  createEmptyCollectionItem,
  moveItem,
} from "@/components/admin/cms/promo-collection-banners/promo-collection-form-utils";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { showError } from "@/lib/toast";
import type { CollectionBannerFormErrors } from "@/schemas/promo-collection-banners-schema";
import { uploadCollectionBannerImage } from "@/services/api/collection-banner";
import { ApiError } from "@/services/api/errors";
import type {
  CollectionBannerFormValues,
  CollectionBannerItemFormValues,
} from "@/types/admin/promo-collection-banners";

type CollectionBannerTabProps = {
  
  entityId: string | null;
  values: CollectionBannerFormValues;
  errors: CollectionBannerFormErrors;
  onChange: (next: CollectionBannerFormValues) => void;
  formId?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function updateItem(
  values: CollectionBannerFormValues,
  index: number,
  patch: Partial<CollectionBannerItemFormValues>,
): CollectionBannerFormValues {
  return {
    ...values,
    items: values.items.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    ),
  };
}

export function CollectionBannerTab({
  entityId,
  values,
  errors,
  onChange,
  formId = "collection-banner-form",
  onSubmit,
}: CollectionBannerTabProps) {
  const fileRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleUpload = async (index: number, file?: File) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const uploaded = await uploadCollectionBannerImage(
        file,
        entityId,
      );
      onChange(
        updateItem(values, index, {
          image: { url: uploaded.url, publicId: uploaded.publicId },
        }),
      );
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Failed to upload image",
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-6">
      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border/70 pb-5">
          <CardTitle className="text-lg font-semibold">
            Section header
          </CardTitle>
          <CardDescription className="mt-1">
            Label and heading shown on the right side of the post-gallery
            collection banner.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="collection-section-label">Section label</Label>
            <Input
              id="collection-section-label"
              value={values.sectionLabel}
              onChange={(event) =>
                onChange({ ...values, sectionLabel: event.target.value })
              }
              placeholder="Collection"
              className="h-11"
            />
            {errors.sectionLabel ? (
              <p className="text-xs text-destructive">{errors.sectionLabel}</p>
            ) : null}
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="collection-section-heading">Section heading</Label>
            <Input
              id="collection-section-heading"
              value={values.sectionHeading}
              onChange={(event) =>
                onChange({ ...values, sectionHeading: event.target.value })
              }
              placeholder="Discover The Beauty In Our Gallery"
              className="h-11"
            />
            {errors.sectionHeading ? (
              <p className="text-xs text-destructive">{errors.sectionHeading}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border/70 pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Collection slides
              </CardTitle>
              <CardDescription className="mt-1">
                Left image carousel synced with titles and descriptions on the
                right.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-2"
              onClick={() =>
                onChange({
                  ...values,
                  items: [...values.items, createEmptyCollectionItem()],
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add slide
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {errors.items ? (
            <p className="text-xs text-destructive">{errors.items}</p>
          ) : null}
          {values.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No collection slides yet. Add titled slides for the gallery
              companion section.
            </p>
          ) : null}

          {values.items.map((item, index) => (
            <div
              key={item.clientKey}
              className="space-y-4 rounded-xl border border-border bg-muted/20 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  Slide {index + 1}
                </p>
                <div className="flex items-center gap-1">
                  <div className="mr-2 flex items-center gap-2">
                    <Switch
                      checked={item.active}
                      onCheckedChange={(checked) =>
                        onChange(updateItem(values, index, { active: checked }))
                      }
                    />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === 0}
                    onClick={() =>
                      onChange({
                        ...values,
                        items: moveItem(values.items, index, "up"),
                      })
                    }
                    aria-label="Move slide up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === values.items.length - 1}
                    onClick={() =>
                      onChange({
                        ...values,
                        items: moveItem(values.items, index, "down"),
                      })
                    }
                    aria-label="Move slide down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      onChange({
                        ...values,
                        items: values.items.filter((_, i) => i !== index),
                      })
                    }
                    aria-label="Remove slide"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="space-y-2">
                  <Label>Image</Label>
                  {item.image.url ? (
                    <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin Cloudinary preview */}
                      <img
                        src={item.image.url}
                        alt=""
                        className="h-36 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-border bg-muted/10 text-muted-foreground">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={uploadingIndex === index}
                      onClick={() => fileRefs.current[index]?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {uploadingIndex === index ? "Uploading…" : "Upload"}
                    </Button>
                    {item.image.url ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onChange(
                            updateItem(values, index, {
                              image: { url: "", publicId: "" },
                            }),
                          )
                        }
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <input
                    ref={(node) => {
                      fileRefs.current[index] = node;
                    }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      void handleUpload(index, event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </div>

                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor={`collection-title-${index}`}>Title</Label>
                    <Input
                      id={`collection-title-${index}`}
                      value={item.title}
                      onChange={(event) =>
                        onChange(
                          updateItem(values, index, {
                            title: event.target.value,
                          }),
                        )
                      }
                      placeholder="Necklaces"
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`collection-desc-${index}`}>
                      Description
                    </Label>
                    <Textarea
                      id={`collection-desc-${index}`}
                      value={item.description}
                      onChange={(event) =>
                        onChange(
                          updateItem(values, index, {
                            description: event.target.value,
                          }),
                        )
                      }
                      placeholder="Short description shown when this slide is active"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`collection-url-${index}`}>
                      Button click URL
                    </Label>
                    <Input
                      id={`collection-url-${index}`}
                      value={item.buttonUrl}
                      onChange={(event) =>
                        onChange(
                          updateItem(values, index, {
                            buttonUrl: event.target.value,
                          }),
                        )
                      }
                      placeholder="/category or https://… (optional)"
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor={`collection-button-1-label-${index}`}>
                        Hover button 1 label
                      </Label>
                      <Input
                        id={`collection-button-1-label-${index}`}
                        value={item.button1Label}
                        onChange={(event) =>
                          onChange(updateItem(values, index, { button1Label: event.target.value }))
                        }
                        placeholder="Shop SkinCare"
                        className="h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`collection-button-1-url-${index}`}>
                        Hover button 1 URL
                      </Label>
                      <Input
                        id={`collection-button-1-url-${index}`}
                        value={item.button1Url}
                        onChange={(event) =>
                          onChange(updateItem(values, index, { button1Url: event.target.value }))
                        }
                        placeholder="/category"
                        className="h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`collection-button-2-label-${index}`}>
                        Hover button 2 label
                      </Label>
                      <Input
                        id={`collection-button-2-label-${index}`}
                        value={item.button2Label}
                        onChange={(event) =>
                          onChange(updateItem(values, index, { button2Label: event.target.value }))
                        }
                        placeholder="Explore Products"
                        className="h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`collection-button-2-url-${index}`}>
                        Hover button 2 URL
                      </Label>
                      <Input
                        id={`collection-button-2-url-${index}`}
                        value={item.button2Url}
                        onChange={(event) =>
                          onChange(updateItem(values, index, { button2Url: event.target.value }))
                        }
                        placeholder="/category"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </form>
  );
}
