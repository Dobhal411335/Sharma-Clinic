import { describe, expect, it } from "vitest";

import {
  mapPopupBannerConfigToStorefront,
  popupBannerDismissStorageKey,
} from "@/features/popup-banner/popup-banner.service";
import type { PopupBannerConfig } from "@/types/popup-banner";

function makeConfig(
  overrides: Partial<PopupBannerConfig> = {},
): PopupBannerConfig {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    siteCode: "IN",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/popup.jpg",
    imagePublicId: "popup/main",
    miniHeading: "Example Clinic",
    heading: "Explore our services",
    subDescription: "Clear product information.",
    buttonLabel: "Shop now",
    buttonUrl: "/category",
    active: true,
    updatedAt: "2026-10-13T12:00:00.000Z",
    ...overrides,
  };
}

describe("popup-banner.service", () => {
  it("builds a site-scoped session dismiss key", () => {
    expect(popupBannerDismissStorageKey("in")).toBe(
      "clinic.popupBanner.dismissed.IN",
    );
  });

  it("maps an active config to storefront fields", () => {
    expect(mapPopupBannerConfigToStorefront(makeConfig())).toEqual({
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/popup.jpg",
      imageAlt: "Explore our services",
      miniHeading: "Example Clinic",
      heading: "Explore our services",
      subDescription: "Clear product information.",
      buttonLabel: "Shop now",
      buttonUrl: "/category",
    });
  });

  it("returns null when inactive, missing id, or incomplete", () => {
    expect(
      mapPopupBannerConfigToStorefront(makeConfig({ active: false })),
    ).toBeNull();
    expect(mapPopupBannerConfigToStorefront(makeConfig({ id: null }))).toBeNull();
    expect(
      mapPopupBannerConfigToStorefront(makeConfig({ imageUrl: "" })),
    ).toBeNull();
    expect(
      mapPopupBannerConfigToStorefront(makeConfig({ heading: "  " })),
    ).toBeNull();
  });
});
