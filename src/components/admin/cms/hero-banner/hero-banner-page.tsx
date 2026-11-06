"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";

import { HeroBannerForm } from "@/components/admin/cms/hero-banner/hero-banner-form";
import {
  createEmptyFormValues,
  dtoToFormValues,
} from "@/components/admin/cms/hero-banner/hero-banner-form-utils";
import { HeroBannerSkeleton } from "@/components/admin/cms/hero-banner/hero-banner-skeleton";
import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/lib/toast";
import {
  toHeroBannerPayload,
  validateHeroBannerForm,
  type HeroBannerFormErrors,
} from "@/schemas/hero-banner-schema";
import {
  fetchHeroBannerConfig,
  upsertHeroBannerConfig,
} from "@/services/api/hero-banner";
import { ApiError } from "@/services/api/errors";
import type { HeroBannerFormValues } from "@/types/admin/hero-banner";

export function HeroBannerPage() {
  const [values, setValues] = useState<HeroBannerFormValues>(createEmptyFormValues);
  const [errors, setErrors] = useState<HeroBannerFormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const dto = await fetchHeroBannerConfig();
      setValues(dtoToFormValues(dto));
    } catch (error) {
      setLoadError(
        error instanceof ApiError ? error.message : "Failed to load Hero Banner",
      );
      showError(
        error instanceof ApiError ? error.message : "Failed to load Hero Banner",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Intentional data-fetch for the selected site.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hero banner fetch
    void load();
  }, [load]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateHeroBannerForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      if (validation.errors.slides) showError(validation.errors.slides);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const payload = toHeroBannerPayload(validation.data);
      const saved = await upsertHeroBannerConfig(payload);
      setValues(dtoToFormValues(saved));
      showSuccess("Hero Banner saved");
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Failed to save Hero Banner",
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
            <AlertTitle>Could not load Hero Banner</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <HeroBannerSkeleton />
        ) : (
          <HeroBannerForm
           
            values={values}
            errors={errors}
            onChange={setValues}
            onSubmit={handleSubmit}
          />
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            form="hero-banner-form"
            className="gap-2"
            disabled={isLoading || isSubmitting || Boolean(loadError)}
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving…" : "Save hero banners"}
          </Button>
        </div>
      </div>
    </AdminAppShell>
  );
}
