import { cache } from "react";

import { FALLBACK_COMPANY_BASIC_INFO } from "@/features/company-basic-info/company-basic-info.defaults";
import type { CompanyBasicInfo } from "@/types/company-basic-info";

/**
 * Saved clinic profile. Falls back until an admin saves company info.
 * Cached per request via React `cache`.
 */
export const getCompanyBasicInfo = cache(async (): Promise<CompanyBasicInfo> => {
  try {
    const { readSingleton, withSite } = await import("@/features/cms/store");
    const row = await readSingleton("company");
    if (!row) return FALLBACK_COMPANY_BASIC_INFO;
    const data = withSite(row.payload, {
      id: "company",
      updatedAt: row.updatedAt,
    }) as unknown as CompanyBasicInfo;
    return {
      ...FALLBACK_COMPANY_BASIC_INFO,
      ...data,
      mainLogo: data.mainLogo ?? FALLBACK_COMPANY_BASIC_INFO.mainLogo,
      footerLogo: data.footerLogo ?? FALLBACK_COMPANY_BASIC_INFO.footerLogo,
      mobileUiLogo: data.mobileUiLogo ?? FALLBACK_COMPANY_BASIC_INFO.mobileUiLogo,
    };
  } catch {
    return FALLBACK_COMPANY_BASIC_INFO;
  }
});
