"use client";

import {
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type KeyboardEvent,
  type SetStateAction,
} from "react";
import {
  ImagePlus,
  LayoutGrid,
  Plus,
  Stethoscope,
  Trash2,
  Upload,
} from "lucide-react";

import { createEmptyServiceItem } from "@/components/admin/cms/doctors/doctor-page-form-utils";
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
import type { DoctorPageFormErrors } from "@/schemas/doctor-page-schema";
import { uploadDoctorPageImage } from "@/services/api/doctor-page";
import { ApiError } from "@/services/api/errors";
import {
  DOCTOR_SERVICE_ICON_OPTIONS,
  type DoctorPageFormValues,
  type DoctorServiceIconKey,
} from "@/types/admin/doctor-page";

type DoctorPageFormProps = {
  
  recordId: string | null;
  values: DoctorPageFormValues;
  errors: DoctorPageFormErrors;
  onChange: Dispatch<SetStateAction<DoctorPageFormValues>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  formId?: string;
  isSubmitting?: boolean;
};

function ImageField({
  label,
  url,
  uploading,
  onPick,
  onClear,
}: {
  label: string;
  url: string;
  uploading: boolean;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {url ? (
        <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
          <img src={url} alt="" className="h-36 w-full object-cover" />
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
          disabled={uploading}
          onClick={onPick}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload image"}
        </Button>
        {url ? (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function DoctorPageForm({
  recordId,
  values,
  errors,
  onChange,
  onSubmit,
  formId = "doctor-page-form",
  isSubmitting = false,
}: DoctorPageFormProps) {
  const primaryInputRef = useRef<HTMLInputElement | null>(null);
  const secondaryInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingSecondary, setUploadingSecondary] = useState(false);

  const uploadImage = async (
    file: File,
    field: "primary" | "secondary",
  ): Promise<void> => {
    const setUploading =
      field === "primary" ? setUploadingPrimary : setUploadingSecondary;
    setUploading(true);
    try {
      const uploaded = await uploadDoctorPageImage(file, recordId);
      onChange((prev) =>
        field === "primary"
          ? {
              ...prev,
              aboutImageUrl: uploaded.url,
              aboutImagePublicId: uploaded.publicId,
            }
          : {
              ...prev,
              aboutSecondaryImageUrl: uploaded.url,
              aboutSecondaryImagePublicId: uploaded.publicId,
            },
      );
      showSuccess("Image uploaded");
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Image upload failed",
      );
    } finally {
      setUploading(false);
    }
  };

  const preventEnterSubmit = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter") return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    // Allow newlines in textareas; allow Enter on the actual submit button.
    if (target.tagName === "TEXTAREA") return;
    if (target.closest('button[type="submit"]')) return;
    event.preventDefault();
  };

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      onKeyDown={preventEnterSubmit}
      className="space-y-6"
    >
      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border/70">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Section 1 — About</CardTitle>
          </div>
          <CardDescription>
            Heading, description, highlights, CTA, and collage imagery for the
            doctors landing about block.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="about-heading">Heading</Label>
              <Input
                id="about-heading"
                value={values.aboutHeading}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    aboutHeading: event.target.value,
                  }))
                }
              />
              {errors.aboutHeading ? (
                <p className="text-sm text-destructive">
                  {errors.aboutHeading}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience-years">Experience badge years</Label>
              <Input
                id="experience-years"
                type="number"
                min={0}
                max={100}
                placeholder="20"
                value={values.experienceYears}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    experienceYears: event.target.value,
                  }))
                }
              />
              {errors.experienceYears ? (
                <p className="text-sm text-destructive">
                  {errors.experienceYears}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Shown as “{"{n}"} Years Experience” on the about image.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="about-description">Small description</Label>
            <Textarea
              id="about-description"
              rows={4}
              value={values.aboutDescription}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  aboutDescription: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label>Highlights</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    aboutHighlights: [...prev.aboutHighlights, ""],
                  }))
                }
              >
                <Plus className="h-4 w-4" />
                Add highlight
              </Button>
            </div>
            <div className="space-y-2">
              {values.aboutHighlights.map((highlight, index) => (
                <div key={`highlight-${index}`} className="flex gap-2">
                  <Input
                    value={highlight}
                    placeholder="Positive Feedback"
                    onChange={(event) =>
                      onChange((prev) => {
                        const next = [...prev.aboutHighlights];
                        next[index] = event.target.value;
                        return { ...prev, aboutHighlights: next };
                      })
                    }
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Remove highlight"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        aboutHighlights: prev.aboutHighlights.filter(
                          (_, i) => i !== index,
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            {errors.highlights ? (
              <p className="text-sm text-destructive">{errors.highlights}</p>
            ) : null}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="about-button-label">Button label</Label>
              <Input
                id="about-button-label"
                value={values.aboutButtonLabel}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    aboutButtonLabel: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="about-button-url">Button URL</Label>
              <Input
                id="about-button-url"
                value={values.aboutButtonUrl}
                placeholder="/about"
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    aboutButtonUrl: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <ImageField
                label="Primary about image"
                url={values.aboutImageUrl}
                uploading={uploadingPrimary}
                onPick={() => primaryInputRef.current?.click()}
                onClear={() =>
                  onChange((prev) => ({
                    ...prev,
                    aboutImageUrl: "",
                    aboutImagePublicId: "",
                  }))
                }
              />
              <input
                ref={primaryInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadImage(file, "primary");
                  event.target.value = "";
                }}
              />
            </div>
            <div>
              <ImageField
                label="Secondary / play image (optional)"
                url={values.aboutSecondaryImageUrl}
                uploading={uploadingSecondary}
                onPick={() => secondaryInputRef.current?.click()}
                onClear={() =>
                  onChange((prev) => ({
                    ...prev,
                    aboutSecondaryImageUrl: "",
                    aboutSecondaryImagePublicId: "",
                  }))
                }
              />
              <input
                ref={secondaryInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadImage(file, "secondary");
                  event.target.value = "";
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Section 2 — Services</CardTitle>
              </div>
              <CardDescription className="mt-1">
                Service cards use Lucide icons. Storefront always shows “Read
                More”.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="services-heading">Section heading</Label>
              <Input
                id="services-heading"
                value={values.servicesHeading}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    servicesHeading: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="services-subheading">
                Sub heading / description
              </Label>
              <Textarea
                id="services-subheading"
                rows={3}
                value={values.servicesSubheading}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    servicesSubheading: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1 flex items-center w-fit"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  services: [...prev.services, createEmptyServiceItem()],
                }))
              }
            >
              <Plus className="h-4 w-4" />
              Add service
            </Button>
          </div>
     

          {errors.services ? (
            <p className="text-sm text-destructive">{errors.services}</p>
          ) : null}

          <div className="space-y-4">
            {values.services.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No services yet. Add a service to build the storefront grid.
              </p>
            ) : (
              values.services.map((service, index) => (
                <div
                  key={service.key}
                  className="space-y-4 rounded-xl border border-border p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Service {index + 1}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`service-active-${service.key}`}>
                          Active
                        </Label>
                        <Switch
                          id={`service-active-${service.key}`}
                          checked={service.active}
                          onCheckedChange={(checked) =>
                            onChange((prev) => {
                              const next = [...prev.services];
                              next[index] = { ...service, active: checked };
                              return { ...prev, services: next };
                            })
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Remove service"
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            services: prev.services.filter(
                              (_, i) => i !== index,
                            ),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Select
                        value={service.iconKey}
                        onValueChange={(value) =>
                          onChange((prev) => {
                            const next = [...prev.services];
                            next[index] = {
                              ...service,
                              iconKey: value as DoctorServiceIconKey,
                            };
                            return { ...prev, services: next };
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCTOR_SERVICE_ICON_OPTIONS.map((iconKey) => (
                            <SelectItem key={iconKey} value={iconKey}>
                              {iconKey}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Service name</Label>
                      <Input
                        value={service.name}
                        onChange={(event) =>
                          onChange((prev) => {
                            const next = [...prev.services];
                            next[index] = {
                              ...service,
                              name: event.target.value,
                            };
                            return { ...prev, services: next };
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Small description</Label>
                    <Textarea
                      rows={3}
                      value={service.description}
                      onChange={(event) =>
                        onChange((prev) => {
                          const next = [...prev.services];
                          next[index] = {
                            ...service,
                            description: event.target.value,
                          };
                          return { ...prev, services: next };
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Read more URL</Label>
                    <Input
                      value={service.readMoreUrl}
                      placeholder="/contact"
                      onChange={(event) =>
                        onChange((prev) => {
                          const next = [...prev.services];
                          next[index] = {
                            ...service,
                            readMoreUrl: event.target.value,
                          };
                          return { ...prev, services: next };
                        })
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || uploadingPrimary || uploadingSecondary}
        >
          {isSubmitting ? "Saving…" : "Save doctor page"}
        </Button>
      </div>
    </form>
  );
}
