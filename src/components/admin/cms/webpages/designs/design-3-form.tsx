"use client";

import { ClassicArticleSections } from "@/components/admin/cms/webpages/designs/classic-article-sections";
import type { WebpageEditFormValues } from "@/types/admin/webpages";

/** Design 3: classic article fields without sidebar / accordion / side-thumb. */
export function Design3Form({
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
      variant="design3"
    />
  );
}
