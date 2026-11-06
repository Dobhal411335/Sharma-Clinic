import { FALLBACK_HERO_SLIDES } from "@/features/hero-banner/hero-banner.defaults";
import { mapHeroBannerConfigToStorefront } from "@/features/hero-banner/hero-banner.service";
import type { HeroBannerConfig } from "@/types/hero-banner";

describe("mapHeroBannerConfigToStorefront", () => {
  it("maps active full-width image slides and upgrades Cloudinary http URLs", () => {
    const config: HeroBannerConfig = {
      siteCode: "IN",
      slides: [
        {
          id: "1",
          layoutType: "FULL_WIDTH",
          order: 0,
          active: true,
          mobileImageUrl: "http://res.cloudinary.com/demo/m.jpg",
          mobileImagePublicId: "hero/m",
          desktopImageUrl: "https://res.cloudinary.com/demo/d.jpg",
          desktopImagePublicId: "hero/d",
          miniHeading: "",
          mainHeading: "",
          description: "",
          buttonLabel: "",
          buttonUrl: "/shop",
          button2Label: "",
          button2Url: "",
          leftImageUrl: "",
          leftImagePublicId: "",
          rightImageUrl: "",
          rightImagePublicId: "",
          gridImages: [],
        },
        {
          id: "2",
          layoutType: "SPLIT_DUAL",
          order: 1,
          active: false,
          mobileImageUrl: "",
          mobileImagePublicId: "",
          desktopImageUrl: "",
          desktopImagePublicId: "",
          miniHeading: "",
          mainHeading: "Hidden",
          description: "",
          buttonLabel: "Hidden",
          buttonUrl: "/x",
          button2Label: "Hidden 2",
          button2Url: "/y",
          leftImageUrl: "https://cdn.example.com/left.jpg",
          leftImagePublicId: "hero/left",
          rightImageUrl: "https://cdn.example.com/right.jpg",
          rightImagePublicId: "hero/right",
          gridImages: [],
        },
      ],
    };

    const slides = mapHeroBannerConfigToStorefront(config);
    expect(slides).toHaveLength(1);
    expect(slides[0]!.mobileImageUrl).toBe("https://res.cloudinary.com/demo/m.jpg");
    expect(slides[0]!.layoutType).toBe("FULL_WIDTH");
    expect(slides[0]!.mainHeading).toBe("");
    expect(slides[0]!.buttonUrl).toBe("/shop");
  });

  it("falls back when no active slides exist", () => {
    const slides = mapHeroBannerConfigToStorefront({
      siteCode: "IN",
      slides: [],
    });
    expect(slides).toEqual(FALLBACK_HERO_SLIDES);
  });
});
