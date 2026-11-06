import type { Metadata } from "next";

import { SocialMediaPostPage } from "@/components/admin/cms/social-media-post/social-media-post-page";

export const metadata: Metadata = { title: "SocialMediaPostPage" };

export default function Page() {
  return <SocialMediaPostPage />;
}
