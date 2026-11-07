"use client";

import { useState } from "react";
import { Image as ImageIcon, Plus, Settings, Share2, Trash2 } from "lucide-react";

import {
  Button,
  ImageAssetField,
  Input,
  Label,
  SectionCard,
  SeoKeywordsField,
  StringListField,
  Textarea,
} from "@/components/admin/cms/webpages/webpage-form-fields";
import { ClassicArticleSections } from "@/components/admin/cms/webpages/designs/classic-article-sections";
import type { WebpageEditFormValues } from "@/types/admin/webpages";

export function Design2Form({
  webpageId,
  values,
  setValues,
}: {
  webpageId: string;
  values: WebpageEditFormValues;
  setValues: React.Dispatch<React.SetStateAction<WebpageEditFormValues>>;
}) {
  const [topSectionView, setTopSectionView] = useState<"all" | "bannerOnly">(
    "all",
  );
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

        <div className="space-y-2">
          <Label>Top section view layout</Label>
          <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
            <Button
              type="button"
              size="sm"
              variant={topSectionView === "all" ? "secondary" : "ghost"}
              onClick={() => setTopSectionView("all")}
            >
              All inputs
            </Button>
            <Button
              type="button"
              size="sm"
              variant={topSectionView === "bannerOnly" ? "secondary" : "ghost"}
              onClick={() => setTopSectionView("bannerOnly")}
            >
              Banner image only
            </Button>
          </div>
        </div>

        {topSectionView === "all" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="d2-firstTitle">Main top tag line</Label>
                <Input
                  id="d2-firstTitle"
                  value={values.firstTitle}
                  onChange={(e) => patch("firstTitle", e.target.value)}
                  placeholder="Enter main tagline…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="d2-secondTitle">Main short tag line</Label>
                <Input
                  id="d2-secondTitle"
                  value={values.secondTitle}
                  onChange={(e) => patch("secondTitle", e.target.value)}
                  placeholder="Enter subtitle tagline…"
                />
              </div>
            </div>
            <ImageAssetField
              webpageId={webpageId}
              inputId="d2-image-first"
              label="Main top image (laptop)"
              hint="Supports PNG, JPG, JPEG"
              value={values.imageFirst}
              onChange={(v) => patch("imageFirst", v)}
            />
            <ImageAssetField
              webpageId={webpageId}
              inputId="d2-image-first-mobile"
              label="Main top image (mobile)"
              hint="Recommended size: 800x1000 px"
              value={values.imageFirstMobile}
              onChange={(v) => patch("imageFirstMobile", v)}
            />
          </>
        ) : (
          <>
            <ImageAssetField
              webpageId={webpageId}
              inputId="d2-banner-image"
              label="Main top banner image (laptop)"
              hint="Recommended size: 1200x400 px"
              value={values.bannerImage}
              onChange={(v) => patch("bannerImage", v)}
            />
            <ImageAssetField
              webpageId={webpageId}
              inputId="d2-banner-image-mobile"
              label="Main top banner image (mobile)"
              hint="Recommended size: 800x1000 px"
              value={values.bannerImageMobile}
              onChange={(v) => patch("bannerImageMobile", v)}
            />
          </>
        )}

        <StringListField
          label="Create tags"
          values={values.createTags}
          onChange={(v) => patch("createTags", v)}
          placeholder="Add new tag…"
        />
      </SectionCard>

      <ClassicArticleSections
        webpageId={webpageId}
        values={values}
        setValues={setValues}
      />

      <SectionCard
        title="Sidebar advertisement"
        icon={<Share2 className="size-4" />}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <ImageAssetField
            webpageId={webpageId}
            inputId="d2-sidebar-ad-image"
            label="Advertisement banner image"
            value={values.advertisementImage}
            onChange={(v) => patch("advertisementImage", v)}
          />
          <div className="space-y-2">
            <Label>Advertisement redirect URL</Label>
            <Input
              value={values.advertisementUrl}
              onChange={(e) => patch("advertisementUrl", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Accordion tags" icon={<Plus className="size-4" />}>
        <div className="space-y-3">
          {values.accordionTags.map((row, index) => (
            <div
              key={index}
              className="grid items-end gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 md:grid-cols-[1fr_2fr_auto]"
            >
              <div className="space-y-2">
                <Label>Accordion main title</Label>
                <Input
                  value={row.left}
                  onChange={(e) => {
                    const next = [...values.accordionTags];
                    next[index] = { ...next[index], left: e.target.value };
                    patch("accordionTags", next);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Accordion description</Label>
                <Input
                  value={row.right}
                  onChange={(e) => {
                    const next = [...values.accordionTags];
                    next[index] = { ...next[index], right: e.target.value };
                    patch("accordionTags", next);
                  }}
                />
              </div>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  size="icon"
                  onClick={() =>
                    patch("accordionTags", [
                      ...values.accordionTags,
                      { left: "", right: "" },
                    ])
                  }
                >
                  <Plus className="size-4" />
                </Button>
                {values.accordionTags.length > 1 ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="border-rose-200 text-rose-600"
                    onClick={() =>
                      patch(
                        "accordionTags",
                        values.accordionTags.filter((_, i) => i !== index),
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
      </SectionCard>

      <SectionCard title="Side thumb blog" icon={<ImageIcon className="size-4" />}>
        <div className="grid gap-6 md:grid-cols-2">
          <ImageAssetField
            webpageId={webpageId}
            inputId="d2-side-thumb-image"
            label="Side thumb image"
            value={values.sideThumbImage}
            onChange={(v) => patch("sideThumbImage", v)}
          />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Side thumb name</Label>
              <Input
                value={values.sideThumbName}
                onChange={(e) => patch("sideThumbName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Side thumb designation</Label>
              <Input
                value={values.sideThumbDesignation}
                onChange={(e) => patch("sideThumbDesignation", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Side thumb description</Label>
              <Textarea
                value={values.sideThumbDescription}
                onChange={(e) => patch("sideThumbDescription", e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="grid gap-4 border-t border-border pt-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Facebook profile</Label>
            <Input
              value={values.facebookUrl}
              onChange={(e) => patch("facebookUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>YouTube channel</Label>
            <Input
              value={values.youtubeUrl}
              onChange={(e) => patch("youtubeUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Instagram handle</Label>
            <Input
              value={values.instaUrl}
              onChange={(e) => patch("instaUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Google business link</Label>
            <Input
              value={values.googleUrl}
              onChange={(e) => patch("googleUrl", e.target.value)}
            />
          </div>
        </div>
      </SectionCard>
    </>
  );
}
