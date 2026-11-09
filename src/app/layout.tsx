import type { Metadata } from "next";

import { buildCompanyMetadata } from "@/features/company-basic-info/build-company-metadata";
import { getCompanyBasicInfo } from "@/features/company-basic-info/company-basic-info.service";
import { ToastHost } from "@/lib/toast/toast-host";
import { CompanyBasicInfoProvider } from "@/providers/company-basic-info-provider";
import { Outfit } from "next/font/google";
import { IBM_Plex_Mono } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyBasicInfo();
  return buildCompanyMetadata(company);
}
/** Soft geometric sans — modern beauty / wellness UI. */
const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

/** Clean mono for SKUs / product codes. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

/** Elegant editorial serif for product & section headlines. */
const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const company = await getCompanyBasicInfo();

  return (
    <html
    lang="en-IN"
    className={`${outfit.variable} ${plexMono.variable} ${cormorant.variable} h-full antialiased`}
  >
      <body className="">
        <CompanyBasicInfoProvider value={company}>
          {children}
          <ToastHost />
        </CompanyBasicInfoProvider>
      </body>
    </html>
  );
}
