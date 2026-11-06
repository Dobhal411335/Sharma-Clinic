"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";

import { CollectionBannerTab } from "@/components/admin/cms/promo-collection-banners/collection-banner-tab";
import { PromoBannerTab } from "@/components/admin/cms/promo-collection-banners/promo-banner-tab";
import {
  collectionDtoToFormValues,
  createEmptyCollectionFormValues,
  createEmptyPromoFormValues,
  promoDtoToFormValues,
} from "@/components/admin/cms/promo-collection-banners/promo-collection-form-utils";
import { PromoCollectionSkeleton } from "@/components/admin/cms/promo-collection-banners/promo-collection-skeleton";
import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showError, showSuccess } from "@/lib/toast";
import {
  toCollectionBannerPayload,
  toPromoBannerPayload,
  validateCollectionBannerForm,
  validatePromoBannerForm,
  type CollectionBannerFormErrors,
  type PromoBannerFormErrors,
} from "@/schemas/promo-collection-banners-schema";
import {
  fetchCollectionBannerConfig,
  upsertCollectionBannerConfig,
} from "@/services/api/collection-banner";
import {
  fetchPromoBannerConfig,
  upsertPromoBannerConfig,
} from "@/services/api/promo-banner";
import { ApiError } from "@/services/api/errors";
import type {
  CollectionBannerFormValues,
  PromoBannerFormValues,
} from "@/types/admin/promo-collection-banners";

export function PromoCollectionBannersPage() {
  const [activeTab, setActiveTab] = useState("promo");
  const [promoValues, setPromoValues] = useState<PromoBannerFormValues>(
    createEmptyPromoFormValues,
  );
  const [collectionValues, setCollectionValues] =
    useState<CollectionBannerFormValues>(createEmptyCollectionFormValues);
  const [collectionRecordId, setCollectionRecordId] = useState<string | null>(
    null,
  );
  const [promoErrors, setPromoErrors] = useState<PromoBannerFormErrors>({});
  const [collectionErrors, setCollectionErrors] =
    useState<CollectionBannerFormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingPromo, setIsSubmittingPromo] = useState(false);
  const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [promoDto, collectionDto] = await Promise.all([
        fetchPromoBannerConfig(),
        fetchCollectionBannerConfig(),
      ]);
      setPromoValues(promoDtoToFormValues(promoDto));
      setCollectionValues(collectionDtoToFormValues(collectionDto));
      setCollectionRecordId(collectionDto.id);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Failed to load promo & collection banners";
      setLoadError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Intentional data-fetch for the selected site.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- promo/collection banner fetch
    void load();
  }, [load]);

  const handlePromoSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const validation = validatePromoBannerForm(promoValues);
    if (!validation.success) {
      setPromoErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      if (firstError) showError(firstError);
      return;
    }

    setPromoErrors({});
    setIsSubmittingPromo(true);
    try {
      const payload = toPromoBannerPayload(validation.data);
      const saved = await upsertPromoBannerConfig(payload);
      setPromoValues(promoDtoToFormValues(saved));
      showSuccess("Promo banners saved");
    } catch (error) {
      showError(
        error instanceof ApiError
          ? error.message
          : "Failed to save promo banners",
      );
    } finally {
      setIsSubmittingPromo(false);
    }
  };

  const handleCollectionSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const validation = validateCollectionBannerForm(collectionValues);
    if (!validation.success) {
      setCollectionErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      if (firstError) showError(firstError);
      return;
    }

    setCollectionErrors({});
    setIsSubmittingCollection(true);
    try {
      const payload = toCollectionBannerPayload(validation.data);
      const saved = await upsertCollectionBannerConfig(payload);
      setCollectionValues(collectionDtoToFormValues(saved));
      setCollectionRecordId(saved.id);
      showSuccess("Collection banners saved");
    } catch (error) {
      showError(
        error instanceof ApiError
          ? error.message
          : "Failed to save collection banners",
      );
    } finally {
      setIsSubmittingCollection(false);
    }
  };

  const isSubmitting =
    activeTab === "promo" ? isSubmittingPromo : isSubmittingCollection;
  const formId =
    activeTab === "promo" ? "promo-banner-form" : "collection-banner-form";

  return (
    <AdminAppShell>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {loadError ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load banners</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <PromoCollectionSkeleton />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="promo">Promo banner row</TabsTrigger>
              <TabsTrigger value="collection">
                Collection / gallery banner
              </TabsTrigger>
            </TabsList>

            <TabsContent value="promo">
              <PromoBannerTab
                values={promoValues}
                errors={promoErrors}
                onChange={setPromoValues}
                onSubmit={handlePromoSubmit}
              />
            </TabsContent>

            <TabsContent value="collection">
              <CollectionBannerTab
               
                entityId={collectionRecordId}
                values={collectionValues}
                errors={collectionErrors}
                onChange={setCollectionValues}
                onSubmit={handleCollectionSubmit}
              />
            </TabsContent>
          </Tabs>
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            form={formId}
            className="gap-2"
            disabled={isLoading || isSubmitting || Boolean(loadError)}
          >
            <Save className="h-4 w-4" />
            {isSubmitting
              ? "Saving…"
              : activeTab === "promo"
                ? "Save promo banners"
                : "Save collection banners"}
          </Button>
        </div>
      </div>
    </AdminAppShell>
  );
}
