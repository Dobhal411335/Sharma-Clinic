import type { Metadata } from "next";

import { CreateWebpagesPage } from "@/components/admin/cms/webpages/create-webpages-page";

export const metadata: Metadata = { title: "CreateWebpagesPage" };

export default function Page() {
  return <CreateWebpagesPage />;
}
