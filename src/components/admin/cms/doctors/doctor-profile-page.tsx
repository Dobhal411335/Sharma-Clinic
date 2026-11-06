"use client";

import { useCallback, useEffect, useState } from "react";

import { DoctorProfileForm } from "@/components/admin/cms/doctors/doctor-profile-form";
import { DoctorProfileTable } from "@/components/admin/cms/doctors/doctor-profile-table";
import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/lib/toast";
import {
  extractDoctorPrefixAndName,
  toDoctorProfilePayload,
  validateDoctorProfileForm,
  type DoctorProfileFormErrors,
} from "@/schemas/doctor-profile-schema";
import {
  createDoctorProfile,
  deleteDoctorProfile,
  fetchDoctorProfiles,
  patchDoctorProfile,
  updateDoctorProfile,
} from "@/services/api/doctor-profile";
import { ApiError } from "@/services/api/errors";
import type {
  DoctorProfileDto,
  DoctorProfileFormValues,
} from "@/types/admin/doctor-profile";

function createEmptyFormValues(): DoctorProfileFormValues {
  return {
    prefix: "Dr.",
    name: "",
    specializations: [],
    about: "",
    experienceYears: "",
    state: "",
    city: "",
    phone: "",
    email: "",
    location: "",
    education: "",
    degree: "",
    workHistory: "",
    workDays: "",
    photoUrl: "",
    photoPublicId: "",
    active: true,
    order: "",
  };
}

function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(2, 12);
  }
  return digits.slice(0, 10);
}

function dtoToFormValues(doctor: DoctorProfileDto): DoctorProfileFormValues {
  const { prefix, name } = extractDoctorPrefixAndName(doctor.name);
  return {
    prefix,
    name,
    specializations: Array.isArray(doctor.specializations)
      ? doctor.specializations
      : [],
    about: doctor.about,
    experienceYears: String(doctor.experienceYears ?? ""),
    state: doctor.state ?? "",
    city: doctor.city ?? "",
    phone: phoneDigits(doctor.phone ?? ""),
    email: doctor.email ?? "",
    location: doctor.location ?? "",
    education: doctor.education ?? "",
    degree: doctor.degree ?? "",
    workHistory: doctor.workHistory ?? "",
    workDays: doctor.workDays ?? "",
    photoUrl: doctor.photoUrl,
    photoPublicId: doctor.photoPublicId,
    active: doctor.active,
    order: String(doctor.order ?? ""),
  };
}

export function DoctorProfilePage() {
  const [doctors, setDoctors] = useState<DoctorProfileDto[]>([]);
  const [values, setValues] = useState<DoctorProfileFormValues>(createEmptyFormValues);
  const [errors, setErrors] = useState<DoctorProfileFormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<DoctorProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchDoctorProfiles();
      setDoctors(data);
    } catch (error) {
      setLoadError(
        error instanceof ApiError ? error.message : "Failed to load doctor profiles",
      );
      showError(
        error instanceof ApiError ? error.message : "Failed to load doctor profiles",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Intentional data-fetch for the selected site doctor profiles.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- doctor profiles fetch
    void load();
  }, [load]);

  const resetForm = () => {
    setValues(createEmptyFormValues());
    setEditingId(null);
    setErrors({});
    // Remount so Radix Select clears when state resets to empty.
    setFormKey((key) => key + 1);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateDoctorProfileForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors).find(Boolean);
      if (firstError) showError(firstError);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const payload = toDoctorProfilePayload(validation.data, doctors.length + 1);
      if (editingId) {
        await updateDoctorProfile(editingId, payload);
        showSuccess("Doctor profile updated");
      } else {
        await createDoctorProfile(payload);
        showSuccess("Doctor profile created");
      }
      resetForm();
      await load();
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Failed to save doctor profile",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (doctor: DoctorProfileDto) => {
    setEditingId(doctor.id);
    setValues(dtoToFormValues(doctor));
    setErrors({});
    setFormKey((key) => key + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (doctor: DoctorProfileDto) => {
    try {
      await deleteDoctorProfile(doctor.id);
      showSuccess("Doctor profile deleted");
      if (editingId === doctor.id) {
        resetForm();
      }
      setPendingDelete(null);
      await load();
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Failed to delete doctor profile",
      );
    }
  };

  const handleToggleActive = async (doctor: DoctorProfileDto) => {
    try {
      await patchDoctorProfile(doctor.id, { active: !doctor.active });
      await load();
    } catch (error) {
      showError(
        error instanceof ApiError
          ? error.message
          : "Failed to update doctor visibility",
      );
    }
  };

  const handleMove = async (doctor: DoctorProfileDto, direction: "up" | "down") => {
    const sorted = [...doctors].sort(
      (left, right) => (left.order || 0) - (right.order || 0),
    );
    const index = sorted.findIndex((item) => item.id === doctor.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return;

    const other = sorted[swapIndex]!;
    try {
      await Promise.all([
        patchDoctorProfile(doctor.id, { order: other.order }),
        patchDoctorProfile(other.id, { order: doctor.order }),
      ]);
      await load();
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Failed to reorder doctors",
      );
    }
  };

  return (
    <AdminAppShell>
      <div className="mx-auto w-full max-w-[1400px] space-y-6">
        {loadError ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load doctor profiles</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-3">
              <span>{loadError}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {pendingDelete ? (
          <Alert>
            <AlertTitle>Delete doctor profile?</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Delete {pendingDelete.name}? This cannot be undone.
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPendingDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => void handleDelete(pendingDelete)}
                >
                  Delete
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-8">
          <DoctorProfileForm
            key={formKey}
           
            values={values}
            errors={errors}
            isSubmitting={isSubmitting}
            isEditing={Boolean(editingId)}
            editingId={editingId}
            onChange={setValues}
            onSubmit={(event) => void handleSubmit(event)}
            onReset={resetForm}
          />

          {isLoading ? (
            <div className="h-80 animate-pulse rounded-xl border border-border bg-muted/40" />
          ) : (
            <DoctorProfileTable
              doctors={doctors}
              onEdit={handleEdit}
              onDelete={(doctor) => setPendingDelete(doctor)}
              onToggleActive={(doctor) => void handleToggleActive(doctor)}
              onMove={(doctor, direction) => void handleMove(doctor, direction)}
            />
          )}
        </div>
      </div>
    </AdminAppShell>
  );
}
