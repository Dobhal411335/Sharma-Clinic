"use client";

import { Plus, Settings, Sparkles, Trash2 } from "lucide-react";

import {
  Button,
  ImageAssetField,
  Input,
  Label,
  SectionCard,
  SeoKeywordsField,
} from "@/components/admin/cms/webpages/webpage-form-fields";
import {
  createEmptyGridCard,
  emptyImage,
} from "@/components/admin/cms/webpages/webpage-form-state";
import type { WebpageEditFormValues } from "@/types/admin/webpages";

export function Design5Form({
  webpageId,
  values,
  setValues,
}: {
  
  webpageId: string;
  values: WebpageEditFormValues;
  setValues: React.Dispatch<React.SetStateAction<WebpageEditFormValues>>;
}) {
  const patch = <K extends keyof WebpageEditFormValues>(
    key: K,
    value: WebpageEditFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <SectionCard title="Page settings" icon={<Settings className="size-4" />}>
        <SeoKeywordsField
          titleLine={values.titleLine}
          keywords={values.keywords}
          onTitleLineChange={(v) => patch("titleLine", v)}
          onKeywordsChange={(v) => patch("keywords", v)}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Main top tag line</Label>
            <Input
              value={values.firstTitle}
              onChange={(e) => patch("firstTitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Main short tag line</Label>
            <Input
              value={values.secondTitle}
              onChange={(e) => patch("secondTitle", e.target.value)}
            />
          </div>
        </div>
        <ImageAssetField
         
          webpageId={webpageId}
          inputId="d5-image-first"
          label="Main top image (laptop)"
          value={values.imageFirst}
          onChange={(v) => patch("imageFirst", v)}
        />
        <ImageAssetField
         
          webpageId={webpageId}
          inputId="d5-image-first-mobile"
          label="Main top image (mobile)"
          value={values.imageFirstMobile}
          onChange={(v) => patch("imageFirstMobile", v)}
        />
      </SectionCard>

      <SectionCard
        title="Design 5 layout configuration"
        icon={<Sparkles className="size-4" />}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Top tag chip text</Label>
            <Input
              value={values.design5Chip}
              onChange={(e) => patch("design5Chip", e.target.value)}
              placeholder="e.g. Why Choose Us"
            />
          </div>
          <div className="space-y-2">
            <Label>Main heading section</Label>
            <Input
              value={values.design5MainHeading}
              onChange={(e) => patch("design5MainHeading", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Label>Grid display cards</Label>
          {values.gridCards.map((card, index) => (
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
                      "gridCards",
                      values.gridCards.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <ImageAssetField
                 
                  webpageId={webpageId}
                  inputId={`d5-grid-${index}`}
                  label="Card image cover"
                  value={card.image || emptyImage()}
                  onChange={(img) => {
                    const next = [...values.gridCards];
                    next[index] = { ...next[index], image: img };
                    patch("gridCards", next);
                  }}
                />
                <div className="grid gap-3.5 md:col-span-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Chip category</Label>
                    <Input
                      value={card.chipName}
                      onChange={(e) => {
                        const next = [...values.gridCards];
                        next[index] = {
                          ...next[index],
                          chipName: e.target.value,
                        };
                        patch("gridCards", next);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Card title</Label>
                    <Input
                      value={card.title}
                      onChange={(e) => {
                        const next = [...values.gridCards];
                        next[index] = { ...next[index], title: e.target.value };
                        patch("gridCards", next);
                      }}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Explore redirect link URL</Label>
                    <Input
                      value={card.link}
                      onChange={(e) => {
                        const next = [...values.gridCards];
                        next[index] = { ...next[index], link: e.target.value };
                        patch("gridCards", next);
                      }}
                      placeholder="/explore/…"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            onClick={() =>
              patch("gridCards", [...values.gridCards, createEmptyGridCard()])
            }
          >
            <Plus className="mr-1 size-3.5" /> Add grid card
          </Button>
        </div>
      </SectionCard>
    </>
  );
}
