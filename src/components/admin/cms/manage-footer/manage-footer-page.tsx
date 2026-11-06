"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";

import { ManageFooterForm } from "@/components/admin/cms/manage-footer/manage-footer-form";
import {
  createEmptyFormValues,
  dtoToFormValues,
} from "@/components/admin/cms/manage-footer/manage-footer-form-utils";
import { ManageFooterSkeleton } from "@/components/admin/cms/manage-footer/manage-footer-skeleton";
import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/lib/toast";
import {
  toFooterConfigPayload,
  validateManageFooterForm,
  type ManageFooterFormErrors,
} from "@/schemas/manage-footer-schema";
import {
  fetchFooterConfig,
  upsertFooterConfig,
} from "@/services/api/manage-footer";
import { ApiError } from "@/services/api/errors";
import type { ManageFooterFormValues } from "@/types/admin/manage-footer";

export function ManageFooterPage() {
  const [values, setValues] = useState<ManageFooterFormValues>(createEmptyFormValues);
  const [errors, setErrors] = useState<ManageFooterFormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const dto = await fetchFooterConfig();
      setValues(dtoToFormValues(dto));
    } catch (error) {
      setLoadError(
        error instanceof ApiError ? error.message : "Failed to load footer config",
      );
      showError(
        error instanceof ApiError ? error.message : "Failed to load footer config",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Intentional data-fetch for the selected site.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- footer config fetch
    void load();
  }, [load]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateManageFooterForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      if (firstError) showError(firstError);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const payload = toFooterConfigPayload(validation.data);
      const saved = await upsertFooterConfig(payload);
      setValues(dtoToFormValues(saved));
      showSuccess("Footer settings saved");
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Failed to save footer settings",
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
            <AlertTitle>Could not load footer settings</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-3">
              <span>{loadError}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <ManageFooterSkeleton />
        ) : (
          <ManageFooterForm
            values={values}
            errors={errors}
            onChange={setValues}
            onSubmit={(event) => void handleSubmit(event)}
          />
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            form="manage-footer-form"
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
