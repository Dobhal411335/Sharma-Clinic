import type { Metadata } from "next";

import { HeroBannerPage } from "@/components/admin/cms/hero-banner/hero-banner-page";

export const metadata: Metadata = { title: "HeroBannerPage" };

export default function Page() {
  return <HeroBannerPage />;
}
