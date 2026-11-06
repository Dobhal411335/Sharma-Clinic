import { BlogGrid } from "@/components/landing/blog-grid";
import { CookieConsentBanner } from "@/components/landing/cookie-consent-banner";
import { ClinicalConfidenceSection } from "@/components/landing/clinical-confidence-section";
import { InsightsQaSection } from "@/components/landing/insights-qa-section";
import { HeroSection } from "@/components/landing/hero-section";
import { OurServices } from "@/components/landing/our-services";
import { PromoBannerRow } from "@/components/landing/promo-banner-row";
import { getAboutUsBanner } from "@/features/about-us-banner/about-us-banner.service";
import { getClinicalConfidence } from "@/features/clinical-confidence/clinical-confidence.service";
import { getHeroBanners } from "@/features/hero-banner/hero-banner.service";
import { getLandingInsights } from "@/features/insights/insights.service";
import { getPromoBanners } from "@/features/promo-banner/promo-banner.service";

export default async function HomePage() {
  const [aboutUsBanner, landingInsights, heroSlides, promoBanners, clinicalConfidence] =
    await Promise.all([
      getAboutUsBanner(),
      getLandingInsights(),
      getHeroBanners(),
      getPromoBanners(),
      getClinicalConfidence(),
    ]);

  return (
    <div className="">
      <HeroSection slides={heroSlides} />
      <ClinicalConfidenceSection config={clinicalConfidence} />
      <PromoBannerRow items={promoBanners} />
      <OurServices
        servicesHeading={
          aboutUsBanner.servicesHeading ?? "Caring for your child, every step of the way"
        }
        servicesViewAll={
          aboutUsBanner.servicesViewAll ?? { label: "View all services", href: "/services" }
        }
        services={aboutUsBanner.services ?? []}
      />
      <BlogGrid />
      <InsightsQaSection items={landingInsights.qaItems} />
      <CookieConsentBanner />
    </div>
  );
}
