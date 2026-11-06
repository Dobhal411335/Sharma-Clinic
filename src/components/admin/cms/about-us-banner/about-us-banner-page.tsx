"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";

import { AboutUsBannerForm } from "@/components/admin/cms/about-us-banner/about-us-banner-form";
import {
  createEmptyFormValues,
  dtoToFormValues,
} from "@/components/admin/cms/about-us-banner/about-us-banner-form-utils";
import { AboutUsBannerSkeleton } from "@/components/admin/cms/about-us-banner/about-us-banner-skeleton";
import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/lib/toast";
import {
  toAboutUsBannerPayload,
  validateAboutUsBannerForm,
  type AboutUsBannerFormErrors,
} from "@/schemas/about-us-banner-schema";
import {
  fetchAboutUsBannerConfig,
  upsertAboutUsBannerConfig,
} from "@/services/api/about-us-banner";
import { ApiError } from "@/services/api/errors";
import type { AboutUsBannerFormValues } from "@/types/admin/about-us-banner";

export function AboutUsBannerPage() {
  const [values, setValues] = useState<AboutUsBannerFormValues>(
    createEmptyFormValues,
  );
  const [recordId, setRecordId] = useState<string | null>(null);
  const [errors, setErrors] = useState<AboutUsBannerFormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const dto = await fetchAboutUsBannerConfig();
      setValues(dtoToFormValues(dto));
      setRecordId(dto.id);
    } catch (error) {
      setLoadError(
        error instanceof ApiError
          ? error.message
          : "Failed to load About Us banner",
      );
      showError(
        error instanceof ApiError
          ? error.message
          : "Failed to load About Us banner",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Intentional data-fetch for the selected site.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- about us banner fetch
    void load();
  }, [load]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateAboutUsBannerForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      if (firstError) showError(firstError);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const payload = toAboutUsBannerPayload(validation.data);
      const saved = await upsertAboutUsBannerConfig(payload);
      setValues(dtoToFormValues(saved));
      setRecordId(saved.id);
      showSuccess("About Us banner saved");
    } catch (error) {
      showError(
        error instanceof ApiError
          ? error.message
          : "Failed to save About Us banner",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminAppShell>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {loadError ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load About Us banner</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <AboutUsBannerSkeleton />
        ) : (
          <AboutUsBannerForm
           
            recordId={recordId}
            values={values}
            errors={errors}
            onChange={setValues}
            onSubmit={handleSubmit}
          />
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            form="about-us-banner-form"
            className="gap-2"
            disabled={isLoading || isSubmitting || Boolean(loadError)}
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving…" : "Save banner"}
          </Button>
        </div>
      </div>
    </AdminAppShell>
  );
}
