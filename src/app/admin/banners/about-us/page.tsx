import type { Metadata } from "next";

import { AboutUsBannerPage } from "@/components/admin/cms/about-us-banner/about-us-banner-page";

export const metadata: Metadata = { title: "AboutUsBannerPage" };

export default function Page() {
  return <AboutUsBannerPage />;
}
