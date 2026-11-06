import { mapNavbarSectionsToNavLinks } from "@/features/navbar-sections/navbar-sections.service";
import type { NavbarSection } from "@/types/navbar-sections";

describe("mapNavbarSectionsToNavLinks", () => {
  it("filters inactive items and sorts by order", () => {
    const sections: NavbarSection[] = [
      {
        id: "2",
        siteCode: "IN",
        title: "About",
        url: "/about",
        active: true,
        order: 2,
        subSections: [],
      },
      {
        id: "1",
        siteCode: "IN",
        title: "Shop",
        url: "/shop",
        active: true,
        order: 1,
        subSections: [
          {
            id: "s2",
            title: "Oils",
            url: "/shop/oils",
            active: true,
            order: 2,
          },
          {
            id: "s1",
            title: "Serums",
            url: "/shop/serums",
            active: true,
            order: 1,
          },
          {
            id: "s3",
            title: "Hidden",
            url: "/shop/hidden",
            active: false,
            order: 3,
          },
        ],
      },
      {
        id: "3",
        siteCode: "IN",
        title: "Hidden Section",
        url: "/hidden",
        active: false,
        order: 0,
        subSections: [],
      },
    ];

    expect(mapNavbarSectionsToNavLinks(sections)).toEqual([
      {
        id: "1",
        label: "Shop",
        href: "/shop",
        children: [
          { id: "s1", label: "Serums", href: "/shop/serums" },
          { id: "s2", label: "Oils", href: "/shop/oils" },
        ],
      },
      {
        id: "2",
        label: "About",
        href: "/about",
        children: [],
      },
    ]);
  });
});
