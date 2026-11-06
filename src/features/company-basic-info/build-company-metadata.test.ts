import { describe, expect, it } from "vitest";

import { buildCompanyMetadata } from "@/features/company-basic-info/build-company-metadata";
import { FALLBACK_COMPANY_BASIC_INFO } from "@/features/company-basic-info/company-basic-info.defaults";

describe("buildCompanyMetadata", () => {
  it("uses company title, keywords, and logo for open graph", () => {
    const metadata = buildCompanyMetadata({
      ...FALLBACK_COMPANY_BASIC_INFO,
      companyName: "Sample Clinic",
      companyDomainName: "sample.example",
      titleTagForMainLandingPage: "Clinical Skincare",
      keywords: ["skincare"],
      mainLogo: {
        url: "https://res.cloudinary.com/demo/image/upload/logo.png",
        publicId: "logo",
      },
    });

    expect(metadata.title).toEqual({
      default: "Clinical Skincare",
      template: "%s | Sample Clinic",
    });
    expect(metadata.description).toBe("Clinical Skincare");
    expect(metadata.applicationName).toBe("Sample Clinic");
    expect(metadata.keywords).toEqual(["skincare"]);
    expect(metadata.openGraph?.images).toEqual([
      { url: "https://res.cloudinary.com/demo/image/upload/logo.png" },
    ]);
    expect(String(metadata.metadataBase)).toContain("sample.example");
  });

  it("falls back when company data is empty", () => {
    const metadata = buildCompanyMetadata(FALLBACK_COMPANY_BASIC_INFO);
    expect(metadata.title).toEqual({
      default: FALLBACK_COMPANY_BASIC_INFO.titleTagForMainLandingPage,
      template: `%s | ${FALLBACK_COMPANY_BASIC_INFO.companyName}`,
    });
  });
});
