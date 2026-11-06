import type { Metadata } from "next";

import { PromoCollectionBannersPage } from "@/components/admin/cms/promo-collection-banners/promo-collection-banners-page";

export const metadata: Metadata = { title: "PromoCollectionBannersPage" };

export default function Page() {
  return <PromoCollectionBannersPage />;
}
