"use client";

import { useRef, useState } from "react";
import { ImageIcon, Plus, Stethoscope, UploadCloud, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { INDIA_STATES } from "@/lib/india-states";
import { showError, showSuccess } from "@/lib/toast";
import {
  DOCTOR_PREFIX_OPTIONS,
  type DoctorProfileFormErrors,
} from "@/schemas/doctor-profile-schema";
import { uploadDoctorPhoto } from "@/services/api/doctor-profile";
import { ApiError } from "@/services/api/errors";
import type { DoctorProfileFormValues } from "@/types/admin/doctor-profile";

type DoctorProfileFormProps = {
  values: DoctorProfileFormValues;
  errors: DoctorProfileFormErrors;
  isSubmitting: boolean;
  isEditing: boolean;
  editingId: string | null;
  /** Admin can edit fee; doctor self-edit is read-only. */
  feeEditable?: boolean;
  onChange: (values: DoctorProfileFormValues) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export function DoctorProfileForm({
  values,
  errors,
  isSubmitting,
  isEditing,
  editingId,
  feeEditable = true,
  onChange,
  onSubmit,
  onReset,
}: DoctorProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [specializationDraft, setSpecializationDraft] = useState("");

  const addSpecialization = () => {
    const next = specializationDraft.trim();
    if (!next) return;
    const exists = values.specializations.some(
      (item) => item.toLowerCase() === next.toLowerCase(),
    );
    if (exists) {
      setSpecializationDraft("");
      return;
    }
    onChange({
      ...values,
      specializations: [...values.specializations, next],
    });
    setSpecializationDraft("");
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadDoctorPhoto(file, editingId);
      onChange({
        ...values,
        photoUrl: uploaded.url,
        photoPublicId: uploaded.publicId,
      });
      showSuccess("Doctor photo uploaded");
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
          <Stethoscope className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">
            {isEditing ? "Edit Doctor Profile" : "Create Doctor Profile"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Photo <span className="text-destructive">*</span>
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => void handleUpload(event)}
              />
              {!values.photoUrl ? (
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
                        <p className="text-sm font-medium">Upload doctor photo</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          JPG, PNG, or WebP
                        </p>
                      </div>
                    </>
                  )}
                </button>
              ) : (
                <div className="relative overflow-hidden rounded-[14px] border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin Cloudinary preview */}
                  <img
                    src={values.photoUrl}
                    alt=""
                    className="h-80 w-full object-contain"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-black/10 p-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        onChange({ ...values, photoUrl: "", photoPublicId: "" })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
              {errors.photoUrl ? (
                <p className="text-sm text-destructive">{errors.photoUrl}</p>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor-name">
                  Doctor name <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <div className="w-36 shrink-0">
                    <Select
                      value={values.prefix || "Dr."}
                      onValueChange={(prefix) =>
                        onChange({ ...values, prefix })
                      }
                    >
                      <SelectTrigger id="doctor-prefix" aria-label="Doctor title prefix" className="w-full">
                        <SelectValue placeholder="Prefix" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCTOR_PREFIX_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Input
                      id="doctor-name"
                      value={values.name}
                      placeholder="Daisy Bins"
                      onChange={(event) =>
                        onChange({ ...values, name: event.target.value })
                      }
                    />
                  </div>
                </div>
                {errors.name ? (
                  <p className="text-sm text-destructive">{errors.name}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Saved as{" "}
                    <span className="font-medium text-foreground">
                      {values.prefix || "Dr."} {values.name.trim() || "…"}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor-specialization">
                  Specialization <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="doctor-specialization"
                    value={specializationDraft}
                    placeholder="Dermatology"
                    onChange={(event) => setSpecializationDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addSpecialization();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Add specialization"
                    onClick={addSpecialization}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                {values.specializations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {values.specializations.map((item) => (
                      <Badge key={item} variant="secondary" className="gap-1 pr-1">
                        {item}
                        <button
                          type="button"
                          aria-label={`Remove ${item}`}
                          className="rounded-full p-0.5 hover:bg-muted"
                          onClick={() =>
                            onChange({
                              ...values,
                              specializations: values.specializations.filter(
                                (current) => current !== item,
                              ),
                            })
                          }
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : null}
                {errors.specializations ? (
                  <p className="text-sm text-destructive">{errors.specializations}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor-experience">
                  Experience (years) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="doctor-experience"
                  type="number"
                  min={0}
                  max={80}
                  value={values.experienceYears}
                  onChange={(event) =>
                    onChange({ ...values, experienceYears: event.target.value })
                  }
                />
                {errors.experienceYears ? (
                  <p className="text-sm text-destructive">{errors.experienceYears}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="doctor-state">
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={values.state || undefined}
                    onValueChange={(value) =>
                      onChange({
                        ...values,
                        state: value,
                      })
                    }
                  >
                    <SelectTrigger id="doctor-state" className="w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIA_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state ? (
                    <p className="text-sm text-destructive">{errors.state}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor-city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="doctor-city"
                    value={values.city}
                    placeholder="Mumbai"
                    onChange={(event) =>
                      onChange({ ...values, city: event.target.value })
                    }
                  />
                  {errors.city ? (
                    <p className="text-sm text-destructive">{errors.city}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor-phone">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <div className="flex overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                  <span className="flex select-none items-center border-r border-input bg-muted/60 px-3 text-sm font-medium text-muted-foreground">
                    +91
                  </span>
                  <Input
                    id="doctor-phone"
                    type="tel"
                    inputMode="numeric"
                    value={values.phone}
                    placeholder="9876543210"
                    className="border-0 shadow-none focus-visible:ring-0"
                    onChange={(event) =>
                      onChange({
                        ...values,
                        phone: event.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                  />
                </div>
                {errors.phone ? (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor-email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="doctor-email"
                  type="email"
                  value={values.email}
                  placeholder="doctor@example.com"
                  readOnly
                  disabled
                  aria-readonly="true"
                  className="cursor-not-allowed bg-muted/50"
                />
                {errors.email ? (
                  <p className="text-sm text-destructive">{errors.email}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor-location">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="doctor-location"
                  rows={3}
                  value={values.location}
                  placeholder="Clinic address or practice location"
                  onChange={(event) =>
                    onChange({ ...values, location: event.target.value })
                  }
                />
                {errors.location ? (
                  <p className="text-sm text-destructive">{errors.location}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor-about">
                  About <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="doctor-about"
                  rows={5}
                  value={values.about}
                  placeholder="Short description shown on doctor cards"
                  onChange={(event) =>
                    onChange({ ...values, about: event.target.value })
                  }
                />
                {errors.about ? (
                  <p className="text-sm text-destructive">{errors.about}</p>
                ) : null}
              </div>

              <div className="space-y-2 rounded-lg border border-border px-3 py-3">
                <Label htmlFor="doctor-fee">
                  Consultation fee (INR) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="doctor-fee"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={values.consultationFeeInr}
                  placeholder="0"
                  readOnly={!feeEditable}
                  disabled={!feeEditable}
                  onChange={(event) =>
                    onChange({
                      ...values,
                      consultationFeeInr: event.target.value,
                    })
                  }
                />
                {errors.consultationFeeInr ? (
                  <p className="text-sm text-destructive">
                    {errors.consultationFeeInr}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="doctor-active">Show on website</Label>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    When on, this doctor appears on the landing page and /doctors
                    (photo required).
                  </p>
                </div>
                <Switch
                  id="doctor-active"
                  checked={values.active}
                  onCheckedChange={(checked) =>
                    onChange({ ...values, active: checked })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-border p-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Qualification</h3>
              <p className="text-xs text-muted-foreground">
                Education, degree, work history, and working days shown on the doctor profile.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="doctor-education">Education</Label>
                <Textarea
                  id="doctor-education"
                  rows={4}
                  value={values.education}
                  placeholder="MBBS, internship, fellowships"
                  onChange={(event) =>
                    onChange({ ...values, education: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-degree">Degree</Label>
                <Textarea
                  id="doctor-degree"
                  rows={4}
                  value={values.degree}
                  placeholder="MD Dermatology"
                  onChange={(event) =>
                    onChange({ ...values, degree: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-work-history">Work history</Label>
                <Textarea
                  id="doctor-work-history"
                  rows={4}
                  value={values.workHistory}
                  placeholder="Hospitals, clinics, and roles"
                  onChange={(event) =>
                    onChange({ ...values, workHistory: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-work-days">Work days</Label>
                <Textarea
                  id="doctor-work-days"
                  rows={4}
                  value={values.workDays}
                  placeholder="Mon–Sat, 10:00 AM – 6:00 PM"
                  onChange={(event) =>
                    onChange({ ...values, workDays: event.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isSubmitting || uploading}>
              {isSubmitting
                ? "Saving…"
                : isEditing
                  ? "Update profile"
                  : "Create profile"}
            </Button>
            {isEditing ? (
              <Button type="button" variant="outline" onClick={onReset}>
                Cancel edit
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
