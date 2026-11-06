import type { Metadata } from "next";

import { CompanyBasicInfoPage } from "@/components/admin/cms/company-basic-info/company-basic-info-page";

export const metadata: Metadata = { title: "CompanyBasicInfoPage" };

export default function Page() {
  return <CompanyBasicInfoPage />;
}
