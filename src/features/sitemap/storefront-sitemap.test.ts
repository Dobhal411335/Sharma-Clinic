import { describe, expect, it } from "vitest";

import {
  buildSitemapGroups,
  storefrontOrigin,
  toSitemapEntries,
} from "@/features/sitemap/storefront-sitemap";

describe("storefront sitemap", () => {
  it("normalizes the public site origin", () => {
    expect(storefrontOrigin("")).toBe("https://example.com");
    expect(storefrontOrigin("example.com")).toBe("https://example.com");
    expect(storefrontOrigin("https://example.com/")).toBe("https://example.com");
  });

  it("lists public pages and skips reserved content slugs", () => {
    const groups = buildSitemapGroups({
      blogs: [{ title: "Reading a label", slug: "reading-a-label" }],
      pages: [
        { title: "Privacy Policy", slug: "privacy-policy" },
        { title: "Careers duplicate", slug: "careers" },
        { title: "Account", slug: "account" },
      ],
    });

    const hrefs = groups.flatMap((group) => group.links.map((link) => link.href));
    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/",
        "/about",
        "/doctors",
        "/careers",
        "/blog",
        "/blog/reading-a-label",
        "/testimonials",
        "/privacy-policy",
        "/contact",
        "/faq",
      ]),
    );
    expect(hrefs).not.toContain("/category");
    expect(hrefs).not.toContain("/products/daily-serum");
    expect(hrefs).not.toContain("/careers-duplicate");
    expect(hrefs).not.toContain("/account");
    expect(hrefs.filter((href) => href === "/careers")).toHaveLength(1);
  });

  it("builds absolute search-engine urls from the same links", () => {
    const groups = buildSitemapGroups({
      blogs: [],
      pages: [],
    });
    const entries = toSitemapEntries("https://example.com", groups);
    const urls = entries.map((entry) => entry.url);
    expect(urls).toContain("https://example.com");
    expect(urls).toContain("https://example.com/sitemap");
    expect(urls).not.toContain("https://example.com/account");
    expect(urls).not.toContain("https://example.com/cart");
    expect(entries.find((entry) => entry.url === "https://example.com")?.priority).toBe(1);
  });
});
