"use client";

import { Settings } from "lucide-react";

import {
  ImageAssetField,
  SectionCard,
  PostedByField,
  SeoKeywordsField,
  StringListField,
} from "@/components/admin/cms/webpages/webpage-form-fields";
import { ClassicArticleSections } from "@/components/admin/cms/webpages/designs/classic-article-sections";
import type { WebpageEditFormValues } from "@/types/admin/webpages";

/** Design 3: hero images, tags, and posted-by. No sidebar, accordion, or side thumb. */
export function Design3Form({
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
        <ImageAssetField
          webpageId={webpageId}
          inputId="d3-image-first"
          label="Main top image (laptop)"
          hint="Supports PNG, JPG, JPEG"
          value={values.imageFirst}
          onChange={(v) => patch("imageFirst", v)}
        />
        <ImageAssetField
          webpageId={webpageId}
          inputId="d3-image-first-mobile"
          label="Main top image (mobile)"
          hint="Recommended size: 800x1000 px"
          value={values.imageFirstMobile}
          onChange={(v) => patch("imageFirstMobile", v)}
        />
        <StringListField
          label="Create tags"
          values={values.createTags}
          onChange={(v) => patch("createTags", v)}
          placeholder="Add new tag…"
        />
        <PostedByField
          admin={values.postedBy.admin}
          user={values.postedBy.user}
          onChange={(v) => patch("postedBy", v)}
        />
      </SectionCard>

      <ClassicArticleSections
        webpageId={webpageId}
        values={values}
        setValues={setValues}
      />
    </>
  );
}
