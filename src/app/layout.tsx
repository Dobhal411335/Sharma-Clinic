import type { Metadata } from "next";

import { buildCompanyMetadata } from "@/features/company-basic-info/build-company-metadata";
import { getCompanyBasicInfo } from "@/features/company-basic-info/company-basic-info.service";
import { ToastHost } from "@/lib/toast/toast-host";
import { CompanyBasicInfoProvider } from "@/providers/company-basic-info-provider";

import "./globals.css";
export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyBasicInfo();
  return buildCompanyMetadata(company);
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const company = await getCompanyBasicInfo();

  return (
    <html lang="en" className={`font-serif`}>
      <body>
        <CompanyBasicInfoProvider value={company}>
          {children}
          <ToastHost />
        </CompanyBasicInfoProvider>
      </body>
    </html>
  );
}
