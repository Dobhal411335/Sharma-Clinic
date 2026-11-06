import type { Metadata } from "next";

import { TopAdvertisementPage } from "@/components/admin/cms/top-advertisement/top-advertisement-page";

export const metadata: Metadata = { title: "TopAdvertisementPage" };

export default function Page() {
  return <TopAdvertisementPage />;
}
