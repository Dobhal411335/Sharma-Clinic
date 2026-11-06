import { mapFooterConfigToStorefront } from "@/features/footer/footer.service";
import { FALLBACK_FOOTER } from "@/features/footer/footer.defaults";
import type { FooterConfig } from "@/types/footer";

function makeConfig(overrides: Partial<FooterConfig> = {}): FooterConfig {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    siteCode: "IN",
    thankYou: "Thanks",
    description: "Managed description",
    columns: [
      {
        id: "c1",
        title: "Policies",
        active: true,
        order: 2,
        links: [
          {
            id: "l2",
            label: "Returns",
            url: "/policies/returns",
            active: true,
            order: 2,
          },
          {
            id: "l1",
            label: "Shipping",
            url: "/policies/shipping",
            active: true,
            order: 1,
          },
        ],
      },
      {
        id: "c2",
        title: "Hidden",
        active: false,
        order: 1,
        links: [],
      },
    ],
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("mapFooterConfigToStorefront", () => {
  it("maps active columns/links and sorts by order", () => {
    const mapped = mapFooterConfigToStorefront(makeConfig());
    expect(mapped.thankYou).toBe("Thanks");
    expect(mapped.description).toBe("Managed description");
    expect(mapped.columns).toEqual([
      {
        title: "Policies",
        links: [
          { label: "Shipping", href: "/policies/shipping" },
          { label: "Returns", href: "/policies/returns" },
        ],
      },
    ]);
  });

  it("falls back to static columns when none are active", () => {
    const mapped = mapFooterConfigToStorefront(
      makeConfig({
        columns: [],
        thankYou: "",
        description: "",
      }),
    );
    expect(mapped.columns).toEqual(FALLBACK_FOOTER.columns);
    expect(mapped.thankYou).toBe(FALLBACK_FOOTER.thankYou);
    expect(mapped.description).toBe(FALLBACK_FOOTER.description);
  });
});
