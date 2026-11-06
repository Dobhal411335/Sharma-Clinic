"use client";

import { useRef, useState } from "react";
import { ImageIcon, LayoutTemplate, Link2, Trash2, UploadCloud } from "lucide-react";

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
import { showError, showSuccess } from "@/lib/toast";
import { uploadSocialPostImage } from "@/services/api/social-media-post";
import { ApiError } from "@/services/api/errors";
import type {
  SocialPostFormValues,
  SocialPostType,
} from "@/types/admin/social-media-post";
import type { SocialPostFormErrors } from "@/schemas/social-media-post-schema";

type SocialMediaPostFormProps = {
  
  values: SocialPostFormValues;
  errors: SocialPostFormErrors;
  isSubmitting: boolean;
  isEditing: boolean;
  editingId: string | null;
  activeTab: SocialPostType;
  onChange: (values: SocialPostFormValues) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export function SocialMediaPostForm({
  values,
  errors,
  isSubmitting,
  isEditing,
  editingId,
  activeTab,
  onChange,
  onSubmit,
  onReset,
}: SocialMediaPostFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const platformLabel = activeTab === "instagram" ? "Instagram" : "Facebook";

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadSocialPostImage(file, editingId);
      onChange({
        ...values,
        imageUrl: uploaded.url,
        imagePublicId: uploaded.publicId,
      });
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
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border/70 pb-5">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">
            {isEditing ? `Edit ${platformLabel} Post` : `Add New ${platformLabel} Post`}
          </CardTitle>
        </div>
        <CardDescription>
          Upload a thumbnail and provide the direct link to the social post.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Post Thumbnail <span className="text-destructive">*</span>
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => void handleUpload(event)}
              />
              {!values.imageUrl ? (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-60 w-full flex-col items-center justify-center gap-3 rounded-[14px] border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      <p className="text-sm font-medium text-muted-foreground">
                        Uploading...
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex size-12 items-center justify-center rounded-full bg-background shadow-sm">
                        <UploadCloud className="size-5 text-primary" />
                      </div>
                      <div className="px-4 text-center">
                        <p className="text-sm font-medium">Upload Image</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Recommended: square format
                        </p>
                      </div>
                    </>
                  )}
                </button>
              ) : (
                <div className="relative mx-auto h-60 w-full max-w-[240px] overflow-hidden rounded-[14px] border border-border bg-muted/40 lg:mx-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary previews */}
                  <img
                    src={values.imageUrl}
                    alt="Post thumbnail preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-background/90 p-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        onChange({ ...values, imageUrl: "", imagePublicId: "" })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
              {errors.imageUrl ? (
                <p className="text-sm text-destructive">{errors.imageUrl}</p>
              ) : null}
            </div>

            <div className="flex flex-col justify-center space-y-5">
              <div className="space-y-2">
                <Label htmlFor="social-post-url" className="text-sm font-semibold">
                  {platformLabel} URL <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="social-post-url"
                    name="postUrl"
                    type="url"
                    placeholder={`https://www.${activeTab}.com/...`}
                    value={values.postUrl}
                    onChange={(event) =>
                      onChange({ ...values, postUrl: event.target.value })
                    }
                    className="h-11 pl-10"
                  />
                </div>
                {errors.postUrl ? (
                  <p className="text-sm text-destructive">{errors.postUrl}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Provide the direct link to the post.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="social-post-order" className="text-sm font-semibold">
                    Order
                  </Label>
                  <Input
                    id="social-post-order"
                    name="order"
                    inputMode="numeric"
                    placeholder="Auto"
                    value={values.order}
                    onChange={(event) =>
                      onChange({ ...values, order: event.target.value })
                    }
                    className="h-11"
                  />
                  {errors.order ? (
                    <p className="text-sm text-destructive">{errors.order}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Visibility</Label>
                  <button
                    type="button"
                    onClick={() => onChange({ ...values, active: !values.active })}
                    className={`flex h-11 w-full items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
                      values.active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {values.active ? "Active" : "Hidden"}
                  </button>
                </div>
              </div>

              {!values.imageUrl ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon className="size-3.5" />
                  Thumbnail required before saving.
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border/70 pt-4">
            {isEditing ? (
              <Button type="button" variant="outline" onClick={onReset}>
                Cancel Editing
              </Button>
            ) : null}
            <Button type="submit" disabled={isSubmitting || uploading}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Post" : "Add Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
