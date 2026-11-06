"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";

import { Design1Form } from "@/components/admin/cms/webpages/designs/design-1-form";
import { Design2Form } from "@/components/admin/cms/webpages/designs/design-2-form";
import { Design3Form } from "@/components/admin/cms/webpages/designs/design-3-form";
import { Design4Form } from "@/components/admin/cms/webpages/designs/design-4-form";
import { Design5Form } from "@/components/admin/cms/webpages/designs/design-5-form";
import { Design6Form } from "@/components/admin/cms/webpages/designs/design-6-form";
import { Design7Form } from "@/components/admin/cms/webpages/designs/design-7-form";
import { Design9Form } from "@/components/admin/cms/webpages/designs/design-9-form";
import { Design10Form } from "@/components/admin/cms/webpages/designs/design-10-form";
import { Design11Form } from "@/components/admin/cms/webpages/designs/design-11-form";
import { Design12Form } from "@/components/admin/cms/webpages/designs/design-12-form";
import { Design13Form } from "@/components/admin/cms/webpages/designs/design-13-form";
import { Design14Form } from "@/components/admin/cms/webpages/designs/design-14-form";
import { Design15Form } from "@/components/admin/cms/webpages/designs/design-15-form";
import {
  buildContentPayload,
  createEmptyEditValues,
  dtoToEditValues,
  hasTopBannerContent,
  hasTopTextSectionContent,
} from "@/components/admin/cms/webpages/webpage-form-state";
import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Switch } from "@/components/ui/switch";
import { storefrontBaseUrl } from "@/lib/storefront-url";
import { showError, showSuccess } from "@/lib/toast";
import { ApiError } from "@/services/api/errors";
import {
  fetchWebpage,
  updateWebpageContent,
} from "@/services/api/webpages";
import type { WebpageDto, WebpageEditFormValues } from "@/types/admin/webpages";

function publicWebpageUrl(slug: string): string {
  return `${storefrontBaseUrl()}/${encodeURIComponent(slug)}`;
}

export function EditWebpagePage({
  webpageId,
}: {
  
  webpageId: string;
}) {
  const [webpage, setWebpage] = useState<WebpageDto | null>(null);
  const [values, setValues] = useState<WebpageEditFormValues>(
    createEmptyEditValues,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchWebpage(webpageId);
      setWebpage(data);
      setValues(dtoToEditValues(data));
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Failed to load webpage";
      setLoadError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  }, [webpageId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial webpage load
    void load();
  }, [load]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!webpage) return;

    if (!values.title.trim()) {
      showError("Title is required");
      return;
    }

    const template = values.templateType;
    const skipTopExclusive = template === "design9";
    if (
      !skipTopExclusive &&
      hasTopTextSectionContent(values) &&
      hasTopBannerContent(values)
    ) {
      showError(
        "Please fill either top text section or top banner image, not both.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildContentPayload({
        ...values,
        slug: values.slug.trim() || webpage.slug,
      });
      const updated = await updateWebpageContent(
        webpageId,
        payload as Parameters<typeof updateWebpageContent>[1],
      );
      setWebpage(updated);
      setValues(dtoToEditValues(updated));
      showSuccess("Webpage saved");
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors =
          error.details &&
          typeof error.details === "object" &&
          "fieldErrors" in error.details
            ? (error.details as { fieldErrors?: Record<string, string[]> })
                .fieldErrors
            : undefined;
        const firstFieldError = fieldErrors
          ? Object.entries(fieldErrors)
              .flatMap(([field, messages]) =>
                (messages || []).map((message) => `${field}: ${message}`),
              )
              .find(Boolean)
          : null;
        showError(firstFieldError || error.message || "Failed to save webpage");
      } else {
        showError("Failed to save webpage");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const listHref = "/admin/webpages";

  const designFormProps = {
    webpageId,
    values,
    setValues,
  };

  return (
    <AdminAppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <Button asChild variant="outline" size="sm">
          <Link href={listHref}>
            <ArrowLeft className="mr-1.5 size-4" aria-hidden />
            Back to Create Webpages
          </Link>
        </Button>

        {loadError ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load webpage</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading webpage…</p>
        ) : webpage ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/70">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Webpage details
                      </CardTitle>
                      <CardDescription>
                        Template:{" "}
                        <span className="font-medium text-foreground">
                          {values.templateType}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  {values.slug ? (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={publicWebpageUrl(values.slug)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="mr-1.5 size-4" aria-hidden />
                        View live
                      </a>
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="flex flex-items justify-center w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="webpage-title">Title</Label>
                  <Input
                    id="webpage-title"
                    value={values.title}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 w-full mt-4">
                  <Label htmlFor="webpage-active">Active</Label>
                  <Switch
                    id="webpage-active"
                    checked={values.active}
                    onCheckedChange={(active) =>
                      setValues((prev) => ({ ...prev, active }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {values.templateType === "design1" ? (
              <Design1Form {...designFormProps} />
            ) : null}
            {values.templateType === "design2" ? (
              <Design2Form {...designFormProps} />
            ) : null}
            {values.templateType === "design3" ? (
              <Design3Form {...designFormProps} />
            ) : null}
            {values.templateType === "design4" ? (
              <Design4Form {...designFormProps} />
            ) : null}
            {values.templateType === "design5" ? (
              <Design5Form {...designFormProps} />
            ) : null}
            {values.templateType === "design6" ? (
              <Design6Form {...designFormProps} />
            ) : null}
            {values.templateType === "design7" ? (
              <Design7Form {...designFormProps} />
            ) : null}
            {values.templateType === "design9" ? (
              <Design9Form {...designFormProps} />
            ) : null}
            {values.templateType === "design10" ? (
              <Design10Form {...designFormProps} />
            ) : null}
            {values.templateType === "design11" ? (
              <Design11Form {...designFormProps} />
            ) : null}
            {values.templateType === "design12" ? (
              <Design12Form {...designFormProps} />
            ) : null}
            {values.templateType === "design13" ? (
              <Design13Form {...designFormProps} />
            ) : null}
            {values.templateType === "design14" ? (
              <Design14Form {...designFormProps} />
            ) : null}
            {values.templateType === "design15" ? (
              <Design15Form {...designFormProps} />
            ) : null}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href={listHref}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save webpage"}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </AdminAppShell>
  );
}
