import { cache } from "react";

import type { SocialPost } from "@/types/social-posts";

/**
 * Server-side fetch of active social posts from the CMS store.
 */
export const getSocialPosts = cache(async (): Promise<SocialPost[]> => {
  try {
    const { listItems } = await import("@/features/cms/store");
    const items = (await listItems("social-post")) as unknown as SocialPost[];

    return items
      .filter((post) => post.active && post.imageUrl && post.postUrl)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch {
    return [];
  }
});
