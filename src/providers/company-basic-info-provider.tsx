"use client";

import { createContext, useContext, type ReactNode } from "react";

import { FALLBACK_COMPANY_BASIC_INFO } from "@/features/company-basic-info/company-basic-info.defaults";
import type { CompanyBasicInfo } from "@/types/company-basic-info";

const CompanyBasicInfoContext = createContext<CompanyBasicInfo>(
  FALLBACK_COMPANY_BASIC_INFO,
);

export function CompanyBasicInfoProvider({
  value,
  children,
}: {
  value: CompanyBasicInfo | null | undefined;
  children: ReactNode;
}) {
  return (
    <CompanyBasicInfoContext.Provider
      value={value ?? FALLBACK_COMPANY_BASIC_INFO}
    >
      {children}
    </CompanyBasicInfoContext.Provider>
  );
}

export function useCompanyBasicInfo(): CompanyBasicInfo {
  return useContext(CompanyBasicInfoContext);
}
