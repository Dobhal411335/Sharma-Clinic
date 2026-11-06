import type { Metadata } from "next";

import { PopupBannerPage } from "@/components/admin/cms/popup-banner/popup-banner-page";

export const metadata: Metadata = { title: "PopupBannerPage" };

export default function Page() {
  return <PopupBannerPage />;
}
