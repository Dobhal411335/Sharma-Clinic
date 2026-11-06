"use client";

import {
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { ImagePlus, Megaphone, Upload } from "lucide-react";

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
import { showError, showSuccess } from "@/lib/toast";
import type { PopupBannerFormErrors } from "@/schemas/popup-banner-schema";
import { uploadPopupBannerImage } from "@/services/api/popup-banner";
import { ApiError } from "@/services/api/errors";
import type { PopupBannerFormValues } from "@/types/admin/popup-banner";

type PopupBannerFormProps = {
  
  recordId: string | null;
  values: PopupBannerFormValues;
  errors: PopupBannerFormErrors;
  onChange: Dispatch<SetStateAction<PopupBannerFormValues>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  formId?: string;
};

export function PopupBannerForm({
  recordId,
  values,
  errors,
  onChange,
  onSubmit,
  formId = "popup-banner-form",
}: PopupBannerFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadPopupBannerImage(file, recordId);
      onChange((prev) => ({
        ...prev,
        image: { url: uploaded.url, publicId: uploaded.publicId },
      }));
      showSuccess("Popup image uploaded");
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
    <form id={formId} onSubmit={onSubmit} className="space-y-6">
      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border/70 pb-5">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">PopUp Banner</CardTitle>
          </div>
          <CardDescription>
            One primary landing popup per site. Upload an image, set copy and CTA,
            then toggle active to show it on the storefront.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="popup-active" className="text-sm font-medium">
                Active
              </Label>
              <p className="text-xs text-muted-foreground">
                Inactive popups are hidden from public visitors.
              </p>
            </div>
            <Switch
              id="popup-active"
              checked={values.active}
              onCheckedChange={(checked) =>
                onChange((prev) => ({ ...prev, active: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Image {values.active ? <span className="text-destructive">*</span> : null}
            </Label>
            {values.image.url ? (
              <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of Cloudinary URL */}
                <img
                  src={values.image.url}
                  alt=""
                  className="h-48 w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/10 text-muted-foreground">
                <ImagePlus className="h-6 w-6" />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : "Upload image"}
              </Button>
              {values.image.url ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      image: { url: "", publicId: "" },
                    }))
                  }
                >
                  Remove
                </Button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => void handleUpload(event)}
            />
            {errors.image ? (
              <p className="text-sm text-destructive">{errors.image}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="popup-mini-heading">Mini heading</Label>
              <Input
                id="popup-mini-heading"
                value={values.miniHeading}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    miniHeading: event.target.value,
                  }))
                }
                placeholder="Example Clinic"
                maxLength={100}
              />
              {errors.miniHeading ? (
                <p className="text-sm text-destructive">{errors.miniHeading}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="popup-heading">
                Heading{" "}
                {values.active ? <span className="text-destructive">*</span> : null}
              </Label>
              <Input
                id="popup-heading"
                value={values.heading}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    heading: event.target.value,
                  }))
                }
                placeholder="Explore our services"
                maxLength={300}
              />
              {errors.heading ? (
                <p className="text-sm text-destructive">{errors.heading}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="popup-sub-description">Sub description</Label>
            <Textarea
              id="popup-sub-description"
              value={values.subDescription}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  subDescription: event.target.value,
                }))
              }
              placeholder="Short supporting copy shown in the popup."
              rows={4}
              maxLength={2000}
            />
            {errors.subDescription ? (
              <p className="text-sm text-destructive">{errors.subDescription}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="popup-button-label">
                Button label{" "}
                {values.active ? <span className="text-destructive">*</span> : null}
              </Label>
              <Input
                id="popup-button-label"
                value={values.buttonLabel}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    buttonLabel: event.target.value,
                  }))
                }
                placeholder="Shop now"
                maxLength={100}
              />
              {errors.buttonLabel ? (
                <p className="text-sm text-destructive">{errors.buttonLabel}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="popup-button-url">
                Button click URL{" "}
                {values.active ? <span className="text-destructive">*</span> : null}
              </Label>
              <Input
                id="popup-button-url"
                value={values.buttonUrl}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    buttonUrl: event.target.value,
                  }))
                }
                placeholder="/category"
                maxLength={2000}
              />
              {errors.buttonUrl ? (
                <p className="text-sm text-destructive">{errors.buttonUrl}</p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
