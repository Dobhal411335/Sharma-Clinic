"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";

import { TopAdvertisementForm } from "@/components/admin/cms/top-advertisement/top-advertisement-form";
import {
  createEmptyFormValues,
  dtoToFormValues,
} from "@/components/admin/cms/top-advertisement/top-advertisement-form-utils";
import { TopAdvertisementSkeleton } from "@/components/admin/cms/top-advertisement/top-advertisement-skeleton";
import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/lib/toast";
import {
  toTopAdvertisementPayload,
  validateTopAdvertisementForm,
  type TopAdvertisementFormErrors,
} from "@/schemas/top-advertisement-schema";
import {
  fetchTopAdvertisementConfig,
  upsertTopAdvertisementConfig,
} from "@/services/api/top-advertisement";
import { ApiError } from "@/services/api/errors";
import type { TopAdvertisementFormValues } from "@/types/admin/top-advertisement";

export function TopAdvertisementPage() {
  const [values, setValues] = useState<TopAdvertisementFormValues>(
    createEmptyFormValues,
  );
  const [errors, setErrors] = useState<TopAdvertisementFormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const dto = await fetchTopAdvertisementConfig();
      setValues(dtoToFormValues(dto));
    } catch (error) {
      setLoadError(
        error instanceof ApiError
          ? error.message
          : "Failed to load top advertisement",
      );
      showError(
        error instanceof ApiError
          ? error.message
          : "Failed to load top advertisement",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Intentional data-fetch for the selected site.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- top advertisement fetch
    void load();
  }, [load]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateTopAdvertisementForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      if (firstError) showError(firstError);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const payload = toTopAdvertisementPayload(validation.data);
      const saved = await upsertTopAdvertisementConfig(payload);
      setValues(dtoToFormValues(saved));
      showSuccess("Top advertisement saved");
    } catch (error) {
      showError(
        error instanceof ApiError
          ? error.message
          : "Failed to save top advertisement",
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
            <AlertTitle>Could not load</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <TopAdvertisementSkeleton />
        ) : (
          <TopAdvertisementForm
            values={values}
            errors={errors}
            onChange={setValues}
            onSubmit={handleSubmit}
          />
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            form="top-advertisement-form"
            className="h-11 gap-2"
            disabled={isLoading || isSubmitting || Boolean(loadError)}
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </AdminAppShell>
  );
}
