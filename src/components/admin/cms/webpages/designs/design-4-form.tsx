"use client";

import { Info, Plus, Settings, Share2, Trash2,Sparkles,AlignLeft } from "lucide-react";

import {
  Button,
  ImageAssetField,
  Input,
  Label,
  SectionCard,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SeoKeywordsField,
  Textarea,
  RichHtmlField,
} from "@/components/admin/cms/webpages/webpage-form-fields";
import { ClassicArticleSections } from "@/components/admin/cms/webpages/designs/classic-article-sections";
import { createEmptyParagraphSection, emptyImage } from "@/components/admin/cms/webpages/webpage-form-state";
import { uploadWebpageImage } from "@/services/api/webpages";
import type { WebpageEditFormValues } from "@/types/admin/webpages";

/**
 * Design 4: notices, search locations, ad array + shared classic content
 * (highlights / paragraphs / table / blockquote) without sidebar blocks.
 */
export function Design4Form({
  webpageId,
  values,
  setValues,
}: {
  
  webpageId: string;
  values: WebpageEditFormValues;
  setValues: React.Dispatch<React.SetStateAction<WebpageEditFormValues>>;
}) {
  const uploadInline = async (file: File) => {
    const uploaded = await uploadWebpageImage(file, webpageId);
    return uploaded.url;
  };
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
          inputId="d4-image-first"
          label="Main top image (laptop)"
          value={values.imageFirst}
          onChange={(v) => patch("imageFirst", v)}
        />
        <ImageAssetField
         
          webpageId={webpageId}
          inputId="d4-image-first-mobile"
          label="Main top image (mobile)"
          value={values.imageFirstMobile}
          onChange={(v) => patch("imageFirstMobile", v)}
        />
      </SectionCard>
      <SectionCard title="Page notices" icon={<Info className="size-4" />}>
        <div className="space-y-4">
          {values.notices.map((row, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-border bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  Notice #{index + 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      patch("notices", [
                        ...values.notices,
                        { title: "", description: "", type: "warning" },
                      ])
                    }
                  >
                    <Plus className="mr-1 size-3.5" /> Add notice
                  </Button>
                  {values.notices.length > 1 ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="border-rose-200 text-rose-600"
                      onClick={() =>
                        patch(
                          "notices",
                          values.notices.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Notice title</Label>
                  <Input
                    value={row.title}
                    onChange={(e) => {
                      const next = [...values.notices];
                      next[index] = { ...next[index], title: e.target.value };
                      patch("notices", next);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notice accent type</Label>
                  <Select
                    value={row.type || "warning"}
                    onValueChange={(type) => {
                      const next = [...values.notices];
                      next[index] = { ...next[index], type };
                      patch("notices", next);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="danger">Danger</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notice description</Label>
                <Textarea
                  value={row.description}
                  onChange={(e) => {
                    const next = [...values.notices];
                    next[index] = {
                      ...next[index],
                      description: e.target.value,
                    };
                    patch("notices", next);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Search locations sidebar"
        icon={<Share2 className="size-4" />}
      >
        <div className="space-y-3">
          {values.searchLocations.map((row, index) => (
            <div
              key={index}
              className="grid items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 md:grid-cols-[2fr_1fr_2fr_auto]"
            >
              <Input
                value={row.locationName}
                placeholder="Location name"
                onChange={(e) => {
                  const next = [...values.searchLocations];
                  next[index] = {
                    ...next[index],
                    locationName: e.target.value,
                  };
                  patch("searchLocations", next);
                }}
              />
              <Input
                value={row.count}
                placeholder="Count"
                onChange={(e) => {
                  const next = [...values.searchLocations];
                  next[index] = { ...next[index], count: e.target.value };
                  patch("searchLocations", next);
                }}
              />
              <Input
                value={row.url}
                placeholder="Redirect URL…"
                onChange={(e) => {
                  const next = [...values.searchLocations];
                  next[index] = { ...next[index], url: e.target.value };
                  patch("searchLocations", next);
                }}
              />
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  size="icon"
                  onClick={() =>
                    patch("searchLocations", [
                      ...values.searchLocations,
                      { locationName: "", count: "", url: "" },
                    ])
                  }
                >
                  <Plus className="size-4" />
                </Button>
                {values.searchLocations.length > 1 ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="border-rose-200 text-rose-600"
                    onClick={() =>
                      patch(
                        "searchLocations",
                        values.searchLocations.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-muted/10 p-5">
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Advertisement media array
          </span>
          {values.advertisements.map((ad, index) => (
            <div
              key={index}
              className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-semibold tracking-wide uppercase">
                  Banner advertisement #{index + 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      patch("advertisements", [
                        ...values.advertisements,
                        { image: emptyImage(), url: "" },
                      ])
                    }
                  >
                    + Add ad
                  </Button>
                  {values.advertisements.length > 1 ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="border-rose-200 text-rose-600"
                      onClick={() =>
                        patch(
                          "advertisements",
                          values.advertisements.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ImageAssetField
                 
                  webpageId={webpageId}
                  inputId={`d4-ad-${index}`}
                  label="Banner image"
                  value={ad.image}
                  onChange={(img) => {
                    const next = [...values.advertisements];
                    next[index] = { ...next[index], image: img };
                    patch("advertisements", next);
                  }}
                />
                <div className="space-y-2">
                  <Label>Redirect URL</Label>
                  <Input
                    value={ad.url}
                    onChange={(e) => {
                      const next = [...values.advertisements];
                      next[index] = { ...next[index], url: e.target.value };
                      patch("advertisements", next);
                    }}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Reuse highlights / paragraphs / table / blockquote from classic (variant design3 hides sidebar) */}
      <ClassicArticleSections
       
        webpageId={webpageId}
        values={values}
        setValues={setValues}
        variant="design3"
        includePageSettings={false}
      />
    </>
  );
}
