import type { Metadata } from "next";

import { ManageNavbarPage } from "@/components/admin/cms/manage-navbar/manage-navbar-page";

export const metadata: Metadata = { title: "ManageNavbarPage" };

export default function Page() {
  return <ManageNavbarPage />;
}
