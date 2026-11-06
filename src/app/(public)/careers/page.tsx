import type { Metadata } from "next";

import { CareersPageView } from "@/components/careers/careers-page-view";
import {
  companyAddresses,
  companyDisplayName,
  companyEmails,
  companyPhones,
  pageSeo,
} from "@/data/site";
import { getCompanyBasicInfo } from "@/features/company-basic-info/company-basic-info.service";

export const metadata: Metadata = {
  title: pageSeo.careers.title,
  description: pageSeo.careers.description,
  keywords: [...pageSeo.careers.keywords],
  openGraph: {
    title: pageSeo.careers.title,
    description: pageSeo.careers.description,
  },
  twitter: {
    card: "summary",
    title: pageSeo.careers.title,
    description: pageSeo.careers.description,
  },
};

export default async function CareersPage() {
  const company = await getCompanyBasicInfo();

  return (
    <CareersPageView
      name={companyDisplayName(company.companyName)}
      emails={companyEmails(company.emails)}
      phones={companyPhones(company.contactNumbers)}
      addresses={companyAddresses(company.officeAddresses)}
    />
  );
}
