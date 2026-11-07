"use client";

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
  createEmptyDesign13ExploreCard,
  createEmptyDesign13FaqItem,
  createEmptyDesign13TimelineItem,
  emptyImage,
} from "@/components/admin/cms/webpages/webpage-form-state";
import type { WebpageEditFormValues } from "@/types/admin/webpages";

export function Design13Form({
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
  ) => setValues((p) => ({ ...p, [key]: value }));
  const text = (label: string, key: keyof WebpageEditFormValues) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={String(values[key] || "")}
        onChange={(e) => patch(key, e.target.value as never)}
      />
    </div>
  );
  const rich = (label: string, key: keyof WebpageEditFormValues) => (
    <RichHtmlField
      webpageId={webpageId}
      label={label}
      value={String(values[key] || "")}
      onChange={(v) => patch(key, v as never)}
    />
  );
  const list = <T,>(
    key: keyof WebpageEditFormValues,
    items: T[],
    empty: () => T,
    render: (item: T, update: (value: Partial<T>) => void) => React.ReactNode,
  ) => (
    <div className="space-y-3">
      <Label>{String(key).replace("design13", "")} items</Label>
      {items.map((item, i) => {
        const update = (value: Partial<T>) => {
          const next = [...items];
          next[i] = { ...next[i], ...value };
          patch(key, next as never);
        };
        return (
          <div key={i} className="space-y-3 rounded-xl border p-4">
            <div className="flex justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground">
                Item #{i + 1}
              </span>
              {items.length > 1 && (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    patch(key, items.filter((_, j) => j !== i) as never)
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
            {render(item, update)}
          </div>
        );
      })}
      <Button
        type="button"
        size="sm"
        onClick={() => patch(key, [...items, empty()] as never)}
      >
        <Plus className="mr-1 size-4" /> Add item
      </Button>
    </div>
  );
  return (
    <SectionCard
      title="Design 13 · Contact page"
      icon={<Sparkles className="size-4" />}
    >
      <SeoKeywordsField
        titleLine={values.titleLine}
        keywords={values.keywords}
        onTitleLineChange={(v) => patch("titleLine", v)}
        onKeywordsChange={(v) => patch("keywords", v)}
      />
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Hero section</h3>
        {text("Mini heading", "design13HeroMiniHeading")}
        {text("Main heading", "design13HeroMainHeading")}
        {rich("Description", "design13HeroDescription")}
        <ImageAssetField
          webpageId={webpageId}
          inputId="d13-hero"
          label="Full-width background image"
          value={values.design13HeroImage || emptyImage()}
          onChange={(v) => patch("design13HeroImage", v)}
        />
      </div>
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-base font-semibold">What happens next</h3>
        {text("Mini heading", "design13ProcessMiniHeading")}
        {text("Main heading", "design13ProcessMainHeading")}
        {list(
          "design13ProcessTimeline",
          values.design13ProcessTimeline,
          createEmptyDesign13TimelineItem,
          (item, update) => (
            <>
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input
                  value={item.heading}
                  onChange={(e) => update({ heading: e.target.value })}
                />
              </div>
              <RichHtmlField
                webpageId={webpageId}
                label="Description"
                value={item.description}
                onChange={(v) => update({ description: v })}
              />
            </>
          ),
        )}
      </div>
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-base font-semibold">FAQ</h3>
        {text("Mini heading", "design13FaqMiniHeading")}
        {text("Main heading", "design13FaqMainHeading")}
        {list(
          "design13FaqItems",
          values.design13FaqItems,
          createEmptyDesign13FaqItem,
          (item, update) => (
            <>
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={item.question}
                  onChange={(e) => update({ question: e.target.value })}
                />
              </div>
              <RichHtmlField
                webpageId={webpageId}
                label="Answer"
                value={item.answer}
                onChange={(v) => update({ answer: v })}
              />
            </>
          ),
        )}
      </div>
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-base font-semibold">Continue exploring</h3>
        {text("Mini heading", "design13ExploreMiniHeading")}
        {text("Main heading", "design13ExploreMainHeading")}
        {list(
          "design13ExploreCards",
          values.design13ExploreCards,
          createEmptyDesign13ExploreCard,
          (item, update) => (
            <>
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input
                  value={item.heading}
                  onChange={(e) => update({ heading: e.target.value })}
                />
              </div>
              <RichHtmlField
                webpageId={webpageId}
                label="Sub description"
                value={item.description}
                onChange={(v) => update({ description: v })}
              />
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={item.url}
                  onChange={(e) => update({ url: e.target.value })}
                />
              </div>
            </>
          ),
        )}
      </div>
    </SectionCard>
  );
}
