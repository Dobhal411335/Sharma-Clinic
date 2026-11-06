import type { Metadata } from "next";

import { exampleCompany } from "@/data/site";
import { FALLBACK_COMPANY_BASIC_INFO } from "@/features/company-basic-info/company-basic-info.defaults";
import type { CompanyBasicInfo } from "@/types/company-basic-info";

function normalizeSiteUrl(domainName: string): string | undefined {
  const value = String(domainName || "").trim();
  if (!value) return undefined;

  if (/^https?:\/\//i.test(value)) {
    return value.replace(/\/$/, "");
  }

  return `https://${value.replace(/\/$/, "")}`;
}

/**
 * Builds Next.js Metadata from company basic info (title, OG, Twitter).
 * Does not invent medical claims or product outcomes.
 */
export function buildCompanyMetadata(company: CompanyBasicInfo | null): Metadata {
  const siteName =
    company?.companyName?.trim() || FALLBACK_COMPANY_BASIC_INFO.companyName;
  const savedTitle = company?.titleTagForMainLandingPage?.trim() || "";
  const title =
    savedTitle && savedTitle !== exampleCompany.titleTag ? savedTitle : siteName;
  const keywords =
    company?.keywords?.length && company.keywords.length > 0
      ? company.keywords
      : undefined;
  const siteUrl = normalizeSiteUrl(company?.companyDomainName ?? "");
  const ogImage = company?.mainLogo?.url?.trim() || undefined;

  const metadata: Metadata = {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description: title,
    applicationName: siteName,
    ...(keywords ? { keywords } : {}),
    icons: {
      icon: [
        { url: "/favicon/favicon.ico" },
        { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [
        { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          rel: "android-chrome-192x192",
          url: "/favicon/android-chrome-192x192.png",
        },
        {
          rel: "android-chrome-512x512",
          url: "/favicon/android-chrome-512x512.png",
        },
      ],
    },
    openGraph: {
      title,
      description: title,
      siteName,
      type: "website",
      ...(siteUrl ? { url: siteUrl } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: title,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };

  if (siteUrl) {
    try {
      metadata.metadataBase = new URL(siteUrl);
    } catch {
      // ignore invalid domain
    }
  }

  return metadata;
}
