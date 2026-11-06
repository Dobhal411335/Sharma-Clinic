import type { Metadata } from "next";

import { ManageFooterPage } from "@/components/admin/cms/manage-footer/manage-footer-page";

export const metadata: Metadata = { title: "ManageFooterPage" };

export default function Page() {
  return <ManageFooterPage />;
}
