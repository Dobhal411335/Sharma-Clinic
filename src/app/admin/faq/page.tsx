import type { Metadata } from "next";

import { WebsiteFaqPage } from "@/components/admin/cms/website-faq/website-faq-page";

export const metadata: Metadata = { title: "WebsiteFaqPage" };

export default function Page() {
  return <WebsiteFaqPage />;
}
