import { AboutSplit } from "@/components/landing/about-split";
import { OurServices } from "@/components/landing/our-services";
import { BlogGrid } from "@/components/landing/blog-grid";
import { CookieConsentBanner } from "@/components/landing/cookie-consent-banner";
import { FaqSection } from "@/components/landing/faq-section";
import { FeatureBenefitsBar } from "@/components/landing/feature-benefits-bar";
import { HeroSection } from "@/components/landing/hero-section";
import { InsightsQaSection } from "@/components/landing/insights-qa-section";
import { HowWeWorkSection } from "@/components/landing/how-we-work-section";
import { MarqueeBanner } from "@/components/landing/marquee-banner";
import { CollectionBannerSection } from "@/components/landing/collection-banner-section";
import { ClinicalConfidenceSection } from "@/components/landing/clinical-confidence-section";
import { OurDoctorsSection } from "@/components/landing/our-doctors-section";
import { PromoBannerRow } from "@/components/landing/promo-banner-row";
import { SocialPostsSection } from "@/components/landing/social-posts-section";
import { SpecialsHeader } from "@/components/landing/specials-header";
import { StyleGallery } from "@/components/landing/style-gallery";
import { TestimonialsGrid } from "@/components/landing/testimonials-grid";
import { getAboutUsBanner } from "@/features/about-us-banner/about-us-banner.service";
import { getCollectionBanner } from "@/features/collection-banner/collection-banner.service";
import { getClinicalConfidence } from "@/features/clinical-confidence/clinical-confidence.service";
import { getCustomerReviews } from "@/features/customer-reviews/customer-reviews.service";
import {
  getDoctorProfileFacets,
  getDoctorProfiles,
} from "@/features/doctors/doctors.service";
import { getLandingFaqs } from "@/features/faq/faq.service";
import { getGalleryItems } from "@/features/gallery/gallery.service";
import { getHeroBanners } from "@/features/hero-banner/hero-banner.service";
import { getLandingInsights } from "@/features/insights/insights.service";
import { getPromoBanners } from "@/features/promo-banner/promo-banner.service";
// import {
//   getLandingProductHighlights,
//   getLandingProducts,
// } from "@/features/products/product.service";
import { getSocialPosts } from "@/features/social-posts/social-posts.service";

export default async function HomePage() {
  const [
    socialPosts,
    galleryItems,
    aboutUsBanner,
    customerReviews,
    landingFaqs,
    landingInsights,
    heroSlides,
    // landingProducts,
    // productHighlights,
    promoBanners,
    collectionBanner,
    clinicalConfidence,
    doctors,
    doctorFacets,
  ] = await Promise.all([
    getSocialPosts(),
    getGalleryItems(),
    getAboutUsBanner(),
    getCustomerReviews(),
    getLandingFaqs(),
    getLandingInsights(),
    getHeroBanners(),
    // getLandingProducts(15),
    // getLandingProductHighlights(),
    getPromoBanners(),
    getCollectionBanner(),
    getClinicalConfidence(),
    getDoctorProfiles(),
    getDoctorProfileFacets(),
  ]);

  return (
    <div className="">
      <HeroSection slides={heroSlides} />
      {/* <TrustBenefitsBar /> */}
      <ClinicalConfidenceSection config={clinicalConfidence} />
      <SpecialsHeader promo={aboutUsBanner.promo} />
      <AboutSplit cards={aboutUsBanner.aboutCards} />
      <PromoBannerRow items={promoBanners} />
      <OurDoctorsSection
        doctors={doctors}
        specialities={doctorFacets.specialities}
      />
      <OurServices
        servicesHeading={
          aboutUsBanner.servicesHeading ?? "Caring for your child, every step of the way"
        }
        servicesViewAll={
          aboutUsBanner.servicesViewAll ?? { label: "View all services", href: "/services" }
        }
        services={aboutUsBanner.services ?? []}
      />
      <TestimonialsGrid reviews={customerReviews} />
      <BlogGrid />
      <FeatureBenefitsBar />
      <HowWeWorkSection />
      <StyleGallery items={galleryItems} />
      <CollectionBannerSection banner={collectionBanner} />
      <FaqSection items={landingFaqs} />
      <SocialPostsSection posts={socialPosts} />
      <MarqueeBanner />
      <InsightsQaSection items={landingInsights.qaItems} />
      <CookieConsentBanner />
    </div>
  );
}
