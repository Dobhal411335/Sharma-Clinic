import type { Metadata } from "next";

import { GalleryPage } from "@/components/admin/cms/gallery/gallery-page";

export const metadata: Metadata = { title: "GalleryPage" };

export default function Page() {
  return <GalleryPage />;
}
