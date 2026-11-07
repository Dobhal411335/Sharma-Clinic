"use client";

import { useState } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";

import {
  Button,
  ImageAssetField,
  Input,
  Label,
  RichHtmlField,
  SectionCard,
  SeoKeywordsField,
} from "@/components/admin/cms/webpages/webpage-form-fields";
import {
  createEmptyDesign9Card,
  emptyImage,
} from "@/components/admin/cms/webpages/webpage-form-state";
import { showError, showSuccess } from "@/lib/toast";
import { ApiError } from "@/services/api/errors";
import { uploadWebpageImage } from "@/services/api/webpages";
import type { WebpageEditFormValues, WebpageImageAsset } from "@/types/admin/webpages";

export function Design9Form({
  webpageId,
  values,
  setValues,
}: {
  
  webpageId: string;
  values: WebpageEditFormValues;
  setValues: React.Dispatch<React.SetStateAction<WebpageEditFormValues>>;
}) {
  const [uploadingCardImages, setUploadingCardImages] = useState(false);
  const patch = <K extends keyof WebpageEditFormValues>(
    key: K,
    value: WebpageEditFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const uploadInline = async (file: File) => {
    const uploaded = await uploadWebpageImage(file, webpageId);
    return uploaded.url;
  };

  const handleCardImages = async (
    cardIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setUploadingCardImages(true);
    try {
      const uploaded: WebpageImageAsset[] = [];
      for (const file of files) {
        const result = await uploadWebpageImage(file, webpageId);
        uploaded.push({ url: result.url, key: result.key });
      }
      const next = [...values.design9Cards];
      next[cardIndex] = {
        ...next[cardIndex],
        images: [...(next[cardIndex].images || []), ...uploaded],
      };
      patch("design9Cards", next);
      showSuccess("Images uploaded");
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Image upload failed",
      );
    } finally {
      setUploadingCardImages(false);
      event.target.value = "";
    }
  };

  return (
    <SectionCard
      title="Design 9 content cards layout"
      icon={<Sparkles className="size-4" />}
    >
      <SeoKeywordsField
        titleLine={values.titleLine}
        keywords={values.keywords}
        onTitleLineChange={(v) => patch("titleLine", v)}
        onKeywordsChange={(v) => patch("keywords", v)}
      />

      <ImageAssetField
       
        webpageId={webpageId}
        inputId="d9-banner"
        label="Header banner image (laptop)"
        value={values.bannerImage || emptyImage()}
        onChange={(v) => patch("bannerImage", v)}
      />
      <ImageAssetField
       
        webpageId={webpageId}
        inputId="d9-banner-mobile"
        label="Header banner image (mobile)"
        value={values.bannerImageMobile || emptyImage()}
        onChange={(v) => patch("bannerImageMobile", v)}
      />

      <div className="space-y-2">
        <Label>Mini heading</Label>
        <Input
          value={values.design9MiniHeading}
          onChange={(e) => patch("design9MiniHeading", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Main heading</Label>
        <Input
          value={values.design9MainHeading}
          onChange={(e) => patch("design9MainHeading", e.target.value)}
        />
      </div>
      <RichHtmlField webpageId={webpageId} label="Description"
        value={values.design9Description}
        onChange={(html) => patch("design9Description", html)}
        onUploadImage={uploadInline}
      />

      <div className="space-y-4 pt-2">
        <Label>Content cards</Label>
        {values.design9Cards.map((card, index) => (
          <div
            key={index}
            className="space-y-4 rounded-xl border border-border bg-muted/10 p-4"
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Card #{index + 1}
              </span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="border-rose-200 text-rose-600"
                onClick={() =>
                  patch(
                    "design9Cards",
                    values.design9Cards.filter((_, i) => i !== index),
                  )
                }
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Heading</Label>
              <Input
                value={card.heading}
                onChange={(e) => {
                  const next = [...values.design9Cards];
                  next[index] = { ...next[index], heading: e.target.value };
                  patch("design9Cards", next);
                }}
              />
            </div>
            <RichHtmlField webpageId={webpageId} label="Description"
              value={card.description}
              onChange={(html) => {
                const next = [...values.design9Cards];
                next[index] = { ...next[index], description: html };
                patch("design9Cards", next);
              }}
              onUploadImage={uploadInline}
            />
            <div className="space-y-2">
              <Label>Card images</Label>
              <div className="flex flex-wrap gap-2.5">
                {(card.images || []).map((img, imgIdx) => (
                  <div
                    key={imgIdx}
                    className="relative h-20 w-20 overflow-hidden rounded-lg border border-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt="Card"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      className="absolute top-1 right-1 size-6 border-rose-200 text-rose-600"
                      onClick={() => {
                        const next = [...values.design9Cards];
                        next[index] = {
                          ...next[index],
                          images: (next[index].images || []).filter(
                            (_, i) => i !== imgIdx,
                          ),
                        };
                        patch("design9Cards", next);
                      }}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
                <label className="relative flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background hover:bg-muted/40">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={uploadingCardImages}
                    onChange={(e) => handleCardImages(index, e)}
                  />
                  <Plus className="size-4" />
                  <span className="text-[10px]">
                    {uploadingCardImages ? "…" : "Add"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          onClick={() =>
            patch("design9Cards", [
              ...values.design9Cards,
              createEmptyDesign9Card(),
            ])
          }
        >
          <Plus className="mr-1 size-3.5" /> Add content card
        </Button>
      </div>
    </SectionCard>
  );
}
