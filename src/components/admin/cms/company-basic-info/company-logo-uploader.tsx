import { useRef, useState } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/lib/toast";
import { uploadCompanyLogo } from "@/services/api/company-basic-info";
import { ApiError } from "@/services/api/errors";
import type { CompanyBasicInfoFormValues, CompanyImageRef } from "@/types/admin/company-basic-info";

const logoFields = [
  { key: "mainLogo" as const, label: "Main Logo", desc: "Primary brand logo" },
  { key: "footerLogo" as const, label: "Footer Logo", desc: "Used in footer areas" },
  { key: "mobileUiLogo" as const, label: "Mobile App Logo", desc: "Optimized for small screens" },
];

interface CompanyLogoUploaderProps {
  values: CompanyBasicInfoFormValues;
  recordId: string | null;
  onChange: (field: keyof CompanyBasicInfoFormValues, value: CompanyImageRef) => void;
}

export function CompanyLogoUploader({
  values,
  recordId,
  onChange,
}: CompanyLogoUploaderProps) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadingField, setUploadingField] = useState("");

  const handleUpload = async (
    field: "mainLogo" | "footerLogo" | "mobileUiLogo",
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    try {
      const uploaded = await uploadCompanyLogo(file, recordId);
      onChange(field, uploaded);
      showSuccess("Image uploaded successfully");
    } catch (error) {
      showError(error instanceof ApiError ? error.message : "Cloudinary upload failed");
    } finally {
      setUploadingField("");
      event.target.value = "";
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Brand Assets</CardTitle>
        </div>
        <CardDescription>Upload logos for this website.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        {logoFields.map((field) => {
          const image = values[field.key];
          return (
            <div key={field.key} className="space-y-3">
              <div>
                <Label className="text-sm font-semibold">{field.label}</Label>
                <p className="text-xs text-muted-foreground">{field.desc}</p>
              </div>

              <input
                ref={(node) => {
                  fileInputRefs.current[field.key] = node;
                }}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => void handleUpload(field.key, event)}
              />

              {image.url ? (
                <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-[14px] border border-border bg-muted/40">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary previews */}
                  <img
                    src={image.url}
                    alt={`${field.label} preview`}
                    className="max-h-full max-w-full object-contain p-4"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-background/90 p-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRefs.current[field.key]?.click()}
                      disabled={uploadingField === field.key}
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-9 w-9"
                      onClick={() => onChange(field.key, { url: "", publicId: "" })}
                      aria-label={`Remove ${field.label}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={`flex h-40 w-full flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/40 hover:bg-muted/50 ${
                    uploadingField === field.key ? "animate-pulse" : ""
                  }`}
                  onClick={() => {
                    if (!uploadingField) fileInputRefs.current[field.key]?.click();
                  }}
                  disabled={Boolean(uploadingField)}
                >
                  <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {uploadingField === field.key ? "Uploading..." : "Click to upload"}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">PNG, JPG</span>
                </button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
