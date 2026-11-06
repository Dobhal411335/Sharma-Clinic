import type { ReactNode } from "react";

import { StorefrontShell } from "@/components/layout/storefront-shell";
import { getFooterConfig } from "@/features/footer/footer.service";
import { getNavbarSections } from "@/features/navbar-sections/navbar-sections.service";
import { getTopAdvertisement } from "@/features/top-advertisement/top-advertisement.service";
import { FooterProvider } from "@/providers/footer-provider";
import { NavbarSectionsProvider } from "@/providers/navbar-sections-provider";
import { TopAdvertisementProvider } from "@/providers/top-advertisement-provider";

export default async function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [navbarSections, footer, topAdvertisement] = await Promise.all([
    getNavbarSections(),
    getFooterConfig(),
    getTopAdvertisement(),
  ]);

  return (
    <NavbarSectionsProvider value={navbarSections}>
      <FooterProvider value={footer}>
        <TopAdvertisementProvider value={topAdvertisement}>
          <StorefrontShell>{children}</StorefrontShell>
        </TopAdvertisementProvider>
      </FooterProvider>
    </NavbarSectionsProvider>
  );
}
