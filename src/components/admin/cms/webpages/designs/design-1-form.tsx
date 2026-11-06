"use client";

import { ClassicArticleSections } from "@/components/admin/cms/webpages/designs/classic-article-sections";
import type { WebpageEditFormValues } from "@/types/admin/webpages";

export function Design1Form({
  webpageId,
  values,
  setValues,
}: {
  
  webpageId: string;
  values: WebpageEditFormValues;
  setValues: React.Dispatch<React.SetStateAction<WebpageEditFormValues>>;
}) {
  return (
    <ClassicArticleSections
     
      webpageId={webpageId}
      values={values}
      setValues={setValues}
      variant="design1"
    />
  );
}
