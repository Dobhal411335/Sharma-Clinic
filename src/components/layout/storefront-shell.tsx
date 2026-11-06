"use client";

import type { ReactNode } from "react";

import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { GoogleTrackingTag } from "@/components/layout/google-tracking-tag";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PromoPopupBanner } from "@/components/shared/promo-popup-banner";
import { useCompanyBasicInfo } from "@/providers/company-basic-info-provider";

export function StorefrontShell({ children }: { children: ReactNode }) {
  const company = useCompanyBasicInfo();

  return (
    <>
      <GoogleTrackingTag html={company.googleTrackingTag} />
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <PromoPopupBanner />
    </>
  );
}
