import { cache } from "react";

import type { GalleryItem } from "@/types/gallery";

function isRenderableGalleryItem(item: GalleryItem): boolean {
  if (!item.active) return false;
  if (item.mediaType === "text_card") {
    return Boolean(item.heading?.trim() && item.description?.trim());
  }
  return Boolean(
    item.mediaUrl &&
      (item.mediaType === "image" || item.mediaType === "video"),
  );
}

/**
 * Server-side fetch of active gallery items from the CMS store.
 */
export const getGalleryItems = cache(async (): Promise<GalleryItem[]> => {
  try {
    const { listItems } = await import("@/features/cms/store");
    const items = (await listItems("gallery")) as unknown as GalleryItem[];

    return items
      .map((item) => ({
        ...item,
        clickUrl: item.clickUrl ?? "",
        heading: item.heading ?? "",
        description: item.description ?? "",
        buttonLabel: item.buttonLabel ?? "",
        buttonUrl: item.buttonUrl ?? "",
      }))
      .filter(isRenderableGalleryItem);
  } catch {
    return [];
  }
});
