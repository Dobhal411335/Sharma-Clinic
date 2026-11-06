"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";

import { PopupBannerForm } from "@/components/admin/cms/popup-banner/popup-banner-form";
import {
  createEmptyFormValues,
  dtoToFormValues,
} from "@/components/admin/cms/popup-banner/popup-banner-form-utils";
import { PopupBannerSkeleton } from "@/components/admin/cms/popup-banner/popup-banner-skeleton";
import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/lib/toast";
import {
  toPopupBannerPayload,
  validatePopupBannerForm,
  type PopupBannerFormErrors,
} from "@/schemas/popup-banner-schema";
import {
  fetchPopupBannerConfig,
  upsertPopupBannerConfig,
} from "@/services/api/popup-banner";
import { ApiError } from "@/services/api/errors";
import type { PopupBannerFormValues } from "@/types/admin/popup-banner";

export function PopupBannerPage() {
  const [values, setValues] = useState<PopupBannerFormValues>(
    createEmptyFormValues,
  );
  const [recordId, setRecordId] = useState<string | null>(null);
  const [errors, setErrors] = useState<PopupBannerFormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const dto = await fetchPopupBannerConfig();
      setValues(dtoToFormValues(dto));
      setRecordId(dto.id);
    } catch (error) {
      setLoadError(
        error instanceof ApiError
          ? error.message
          : "Failed to load popup banner",
      );
      showError(
        error instanceof ApiError
          ? error.message
          : "Failed to load popup banner",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Intentional data-fetch for the selected site.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- popup banner fetch
    void load();
  }, [load]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validatePopupBannerForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      if (firstError) showError(firstError);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const payload = toPopupBannerPayload(validation.data);
      const saved = await upsertPopupBannerConfig(payload);
      setValues(dtoToFormValues(saved));
      setRecordId(saved.id);
      showSuccess("Popup banner saved");
    } catch (error) {
      showError(
        error instanceof ApiError
          ? error.message
          : "Failed to save popup banner",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminAppShell>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {loadError ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load popup banner</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <PopupBannerSkeleton />
        ) : (
          <PopupBannerForm
           
            recordId={recordId}
            values={values}
            errors={errors}
            onChange={setValues}
            onSubmit={(event) => void handleSubmit(event)}
          />
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            form="popup-banner-form"
            className="gap-2"
            disabled={isLoading || isSubmitting || Boolean(loadError)}
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving…" : "Save popup"}
          </Button>
        </div>
      </div>
    </AdminAppShell>
  );
}
