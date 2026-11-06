import { FALLBACK_TOP_ADVERTISEMENT } from "@/features/top-advertisement/top-advertisement.defaults";
import { mapTopAdvertisementConfigToStorefront } from "@/features/top-advertisement/top-advertisement.service";
import type { TopAdvertisementConfig } from "@/types/top-advertisement";

function makeConfig(
  overrides: Partial<TopAdvertisementConfig> = {},
): TopAdvertisementConfig {
  return {
    id: "cfg-1",
    siteCode: "IN",
    announcements: [
      {
        id: "a1",
        section: "ANNOUNCEMENT",
        text: "Promo A",
        url: "/shop",
        active: true,
      },
      {
        id: "a2",
        section: "ANNOUNCEMENT",
        text: "Promo B",
        url: "",
        active: true,
      },
    ],
    utilityItems: [
      {
        id: "u1",
        section: "UTILITY",
        text: "Left utility",
        url: "",
        active: true,
      },
    ],
    benefits: [
      {
        id: "b1",
        section: "BENEFIT",
        text: "Secure checkout",
        url: "/policies",
        active: true,
      },
    ],
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("mapTopAdvertisementConfigToStorefront", () => {
  it("maps active items without order/description/icon", () => {
    const mapped = mapTopAdvertisementConfigToStorefront(makeConfig());
    expect(mapped.announcements).toEqual([
      { text: "Promo A", href: "/shop" },
      { text: "Promo B", href: undefined },
    ]);
    expect(mapped.utilityItems).toEqual([{ text: "Left utility" }]);
    expect(mapped.benefits[0]).toEqual({
      title: "Secure checkout",
      href: "/policies",
    });
  });

  it("hides announcements when empty but falls back utility/benefits", () => {
    const mapped = mapTopAdvertisementConfigToStorefront(
      makeConfig({
        announcements: [],
        utilityItems: [],
        benefits: [],
      }),
    );
    expect(mapped.announcements).toEqual([]);
    expect(mapped.utilityItems).toEqual(
      FALLBACK_TOP_ADVERTISEMENT.utilityItems,
    );
    expect(mapped.benefits).toEqual(FALLBACK_TOP_ADVERTISEMENT.benefits);
  });
});
