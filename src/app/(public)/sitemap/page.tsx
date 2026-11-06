import type { Metadata } from "next";

import { SitemapPageView } from "@/components/sitemap/sitemap-page-view";
import { pageSeo } from "@/data/site";
import { getSitemapGroups } from "@/features/sitemap/storefront-sitemap";

export const metadata: Metadata = {
  title: pageSeo.sitemap.title,
  description: pageSeo.sitemap.description,
};

export default async function SitemapPage() {
  const groups = await getSitemapGroups();
  return <SitemapPageView groups={groups} />;
}
