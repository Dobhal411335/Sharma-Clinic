import {
  mapFaqConfigToLandingItems,
  mapFaqConfigToSections,
} from "@/features/faq/faq.service";
import type { FaqConfig } from "@/types/faq";

function makeConfig(overrides: Partial<FaqConfig> = {}): FaqConfig {
  return {
    siteCode: "IN",
    sections: [
      {
        id: "s1",
        title: "General",
        active: true,
        order: 1,
        items: [
          {
            id: "q1",
            question: "Hours?",
            answer: "10–18 IST",
            showOnLanding: true,
            active: true,
            order: 2,
          },
          {
            id: "q2",
            question: "Advice?",
            answer: "No medical advice.",
            showOnLanding: false,
            active: true,
            order: 1,
          },
        ],
      },
      {
        id: "s2",
        title: "Hidden",
        active: false,
        order: 2,
        items: [
          {
            id: "q3",
            question: "Hidden?",
            answer: "Should not appear.",
            showOnLanding: true,
            active: true,
            order: 1,
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe("FAQ storefront mapping", () => {
  it("maps all active headings and answers for the full FAQ page", () => {
    const sections = mapFaqConfigToSections(makeConfig());
    expect(sections).toEqual([
      {
        id: "s1",
        title: "General",
        items: [
          { id: "q2", question: "Advice?", answer: "No medical advice." },
          { id: "q1", question: "Hours?", answer: "10–18 IST" },
        ],
      },
    ]);
  });

  it("maps only showOnLanding items for the landing snippet", () => {
    const items = mapFaqConfigToLandingItems(makeConfig());
    expect(items).toEqual([{ id: "q1", question: "Hours?", answer: "10–18 IST" }]);
  });
});
