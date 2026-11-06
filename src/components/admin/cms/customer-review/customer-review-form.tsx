"use client";

import { useRef, useState } from "react";
import { ImageIcon, Star, Trash2, UploadCloud, UserRound } from "lucide-react";

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
import { uploadCustomerReviewImage } from "@/services/api/customer-review";
import { ApiError } from "@/services/api/errors";
import type { CustomerReviewFormValues } from "@/types/admin/customer-review";
import type { CustomerReviewFormErrors } from "@/schemas/customer-review-schema";
import { cn } from "@/lib/utils";

type CustomerReviewFormProps = {
  
  values: CustomerReviewFormValues;
  errors: CustomerReviewFormErrors;
  isSubmitting: boolean;
  isEditing: boolean;
  editingId: string | null;
  onChange: (values: CustomerReviewFormValues) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export function CustomerReviewForm({
  values,
  errors,
  isSubmitting,
  isEditing,
  editingId,
  onChange,
  onSubmit,
  onReset,
}: CustomerReviewFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadCustomerReviewImage(file, editingId);
      onChange({
        ...values,
        imageUrl: uploaded.url,
        imagePublicId: uploaded.publicId,
      });
      showSuccess("Customer image uploaded successfully");
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
          <UserRound className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">
            {isEditing ? "Edit Customer Review" : "Add Customer Review"}
          </CardTitle>
        </div>
        <CardDescription>
          Upload a customer photo and enter the testimonial shown on the storefront.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Customer Image <span className="text-destructive">*</span>
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
                          Recommended: square portrait
                        </p>
                      </div>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="relative mx-auto size-48 overflow-hidden rounded-full border border-border bg-muted/40 lg:mx-0 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary previews */}
                    <img
                      src={values.imageUrl}
                      alt="Customer preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
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

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="customer-name" className="text-sm font-semibold">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customer-name"
                  value={values.customerName}
                  onChange={(event) =>
                    onChange({ ...values, customerName: event.target.value })
                  }
                  placeholder="Candace V. Miller"
                  className="h-11"
                />
                {errors.customerName ? (
                  <p className="text-sm text-destructive">{errors.customerName}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-designation" className="text-sm font-semibold">
                  Designation <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customer-designation"
                  value={values.designation}
                  onChange={(event) =>
                    onChange({ ...values, designation: event.target.value })
                  }
                  placeholder="From Florida"
                  className="h-11"
                />
                {errors.designation ? (
                  <p className="text-sm text-destructive">{errors.designation}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Rating <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    const selected = values.rating >= value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => onChange({ ...values, rating: value })}
                        className="rounded p-1 transition-colors hover:bg-muted"
                        aria-label={`Set rating to ${value} stars`}
                      >
                        <Star
                          className={cn(
                            "size-6",
                            selected
                              ? "fill-foreground text-foreground"
                              : "text-muted-foreground/40",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
                {errors.rating ? (
                  <p className="text-sm text-destructive">{errors.rating}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-order" className="text-sm font-semibold">
                    Order
                  </Label>
                  <Input
                    id="customer-order"
                    type="number"
                    min={0}
                    value={values.order}
                    onChange={(event) =>
                      onChange({ ...values, order: event.target.value })
                    }
                    placeholder="Auto"
                    className="h-11"
                  />
                  {errors.order ? (
                    <p className="text-sm text-destructive">{errors.order}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-active" className="text-sm font-semibold">
                    Visibility
                  </Label>
                  <label className="flex h-11 items-center gap-2 rounded-md border border-border px-3 text-sm">
                    <input
                      id="customer-active"
                      type="checkbox"
                      checked={values.active}
                      onChange={(event) =>
                        onChange({ ...values, active: event.target.checked })
                      }
                      className="size-4 accent-primary"
                    />
                    Active
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-description" className="text-sm font-semibold">
              Review Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="customer-description"
              value={values.description}
              onChange={(event) =>
                onChange({ ...values, description: event.target.value })
              }
              placeholder="Write the customer testimonial text…"
              rows={5}
            />
            {errors.description ? (
              <p className="text-sm text-destructive">{errors.description}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isSubmitting || uploading}>
              {isSubmitting
                ? "Saving…"
                : isEditing
                  ? "Update Review"
                  : "Add Review"}
            </Button>
            {isEditing ? (
              <Button type="button" variant="outline" onClick={onReset}>
                Cancel
              </Button>
            ) : null}
            {!values.imageUrl ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <ImageIcon className="size-3.5" />
                Image required before save
              </span>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
