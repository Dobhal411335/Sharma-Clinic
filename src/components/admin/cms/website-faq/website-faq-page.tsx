"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";

import { WebsiteFaqForm } from "@/components/admin/cms/website-faq/website-faq-form";
import {
  createEmptyFormValues,
  dtoToFormValues,
} from "@/components/admin/cms/website-faq/website-faq-form-utils";
import { WebsiteFaqSkeleton } from "@/components/admin/cms/website-faq/website-faq-skeleton";
import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/lib/toast";
import {
  toFaqConfigPayload,
  validateWebsiteFaqForm,
  type WebsiteFaqFormErrors,
} from "@/schemas/website-faq-schema";
import { fetchFaqConfig, upsertFaqConfig } from "@/services/api/website-faq";
import { ApiError } from "@/services/api/errors";
import type { WebsiteFaqFormValues } from "@/types/admin/website-faq";

export function WebsiteFaqPage() {
  const [values, setValues] = useState<WebsiteFaqFormValues>(createEmptyFormValues);
  const [errors, setErrors] = useState<WebsiteFaqFormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const dto = await fetchFaqConfig();
      setValues(dtoToFormValues(dto));
    } catch (error) {
      setLoadError(
        error instanceof ApiError ? error.message : "Failed to load FAQ settings",
      );
      showError(
        error instanceof ApiError ? error.message : "Failed to load FAQ settings",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Intentional data-fetch for the selected site.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- FAQ config fetch
    void load();
  }, [load]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateWebsiteFaqForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      if (validation.errors.sections) showError(validation.errors.sections);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const payload = toFaqConfigPayload(validation.data);
      const saved = await upsertFaqConfig(payload);
      setValues(dtoToFormValues(saved));
      showSuccess("FAQ settings saved");
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Failed to save FAQ settings",
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
            <AlertTitle>Could not load FAQ settings</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-3">
              <span>{loadError}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <WebsiteFaqSkeleton />
        ) : (
          <WebsiteFaqForm
            values={values}
            errors={errors}
            onChange={setValues}
            onSubmit={(event) => void handleSubmit(event)}
          />
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            form="website-faq-form"
            className="h-11 bg-primary px-6 hover:bg-primary-hover"
            disabled={isLoading || isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving Changes..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </AdminAppShell>
  );
}
