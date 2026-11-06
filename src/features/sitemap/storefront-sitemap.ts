import { cache } from "react";

import { exampleOrigin } from "@/data/site";
import { getCompanyBasicInfo } from "@/features/company-basic-info/company-basic-info.service";

export type SitemapLink = {
  label: string;
  href: string;
};

export type SitemapGroup = {
  title: string;
  links: SitemapLink[];
};

export type SitemapEntry = {
  url: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
};

export type SitemapSources = {
  blogs: Array<{ title: string; slug: string }>;
  pages: Array<{ title: string; slug: string }>;
};

const STOREFRONT_SITE_CODE = "IN" as const;

/** Slugs already served by a dedicated public route, plus private areas. */
const RESERVED_PAGE_SLUGS = new Set([
  "about",
  "account",
  "admin",
  "api",
  "become-vendor",
  "blog",
  "careers",
  "cart",
  "category",
  "checkout",
  "contact",
  "doctors",
  "faq",
  "products",
  "sitemap",
  "testimonials",
  "unsubscribe",
  "vendor",
  "wishlist",
]);

const COMPANY_LINKS: SitemapLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Doctors", href: "/doctors" },
  { label: "Careers", href: "/careers" },
];

const SUPPORT_LINKS: SitemapLink[] = [
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

type ApiSuccess<T> = {
  success: true;
  data: T;
};

function apiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) return "";
  return value.replace(/\/$/, "");
}

function byLabel(left: SitemapLink, right: SitemapLink): number {
  return left.label.localeCompare(right.label, undefined, { sensitivity: "base" });
}

function pathFor(slug: string): string {
  return `/${encodeURIComponent(slug.trim())}`;
}

function pageLabel(title: string, titleLine: string, slug: string): string {
  const raw = (title || titleLine || slug).trim();
  const beforePipe = raw.split("|")[0]?.trim() || raw;
  return beforePipe.length > 90 ? `${beforePipe.slice(0, 87).trim()}…` : beforePipe;
}

export function storefrontOrigin(domainName: string | null | undefined): string {
  const value = String(domainName || "").trim();
  if (!value) return exampleOrigin;
  if (/^https?:\/\//i.test(value)) return value.replace(/\/$/, "");
  return `https://${value.replace(/\/$/, "")}`;
}

export function buildSitemapGroups(sources: SitemapSources): SitemapGroup[] {
  const seen = new Set<string>();
  const take = (links: SitemapLink[]): SitemapLink[] => {
    const next: SitemapLink[] = [];
    for (const link of links) {
      const href = link.href.trim();
      const label = link.label.trim();
      if (!href || !label || seen.has(href)) continue;
      seen.add(href);
      next.push({ label, href });
    }
    return next;
  };

  const posts = sources.blogs
    .filter((item) => item.title.trim() && item.slug.trim())
    .map((item) => ({
      label: item.title.trim(),
      href: `/blog/${encodeURIComponent(item.slug.trim())}`,
    }))
    .sort(byLabel);

  const pages = sources.pages
    .filter((item) => {
      const slug = item.slug.trim().toLowerCase();
      return item.title.trim() && slug && !RESERVED_PAGE_SLUGS.has(slug);
    })
    .map((item) => ({
      label: item.title.trim(),
      href: pathFor(item.slug),
    }))
    .sort(byLabel);

  const groups: SitemapGroup[] = [
    { title: "Company", links: take(COMPANY_LINKS) },
    {
      title: "Blogs",
      links: take([
        { label: "Blog", href: "/blog" },
        ...posts,
        { label: "Testimonials", href: "/testimonials" },
      ]),
    },
  ];

  const pageLinks = take(pages);
  if (pageLinks.length > 0) {
    groups.push({ title: "Pages", links: pageLinks });
  }

  groups.push({ title: "Support", links: take(SUPPORT_LINKS) });
  return groups;
}

export function toSitemapEntries(origin: string, groups: SitemapGroup[]): SitemapEntry[] {
  const base = origin.replace(/\/$/, "");
  const hrefs = new Set<string>();
  for (const group of groups) {
    for (const link of group.links) hrefs.add(link.href);
  }
  hrefs.add("/sitemap");

  return [...hrefs].map((href) => ({
    url: `${base}${href === "/" ? "" : href}`,
    changeFrequency: href === "/" || href === "/blog" || href.startsWith("/blog/") ? "weekly" : "monthly",
    priority:
      href === "/"
        ? 1
        : href === "/blog" || href === "/doctors"
          ? 0.8
          : href.startsWith("/blog/")
            ? 0.6
            : 0.5,
  }));
}

async function fetchJson<T>(path: string): Promise<ApiSuccess<T> | null> {
  const base = apiBaseUrl();
  if (!base) return null;
  try {
    const response = await fetch(`${base}${path}`, {
      next: { revalidate: 3600, tags: ["sitemap", "IN"] },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return (await response.json()) as ApiSuccess<T>;
  } catch {
    return null;
  }
}

async function loadBlogs(): Promise<Array<{ title: string; slug: string }>> {
  const payload = await fetchJson<{ blogs?: Array<{ title?: string; name?: string; slug?: string }> }>(
    `/sites/${STOREFRONT_SITE_CODE}/blogs`,
  );
  const rows = Array.isArray(payload?.data?.blogs) ? payload.data.blogs : [];
  return rows
    .filter((row) => row?.slug && (row.title || row.name))
    .map((row) => ({
      title: (row.title || row.name || "").trim(),
      slug: row.slug!.trim(),
    }));
}

async function loadPages(): Promise<Array<{ title: string; slug: string }>> {
  const payload = await fetchJson<Array<{ title?: string; titleLine?: string; slug?: string }>>(
    `/sites/${STOREFRONT_SITE_CODE}/webpages`,
  );
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows
    .filter((row) => row?.slug)
    .map((row) => ({
      title: pageLabel(row.title || "", row.titleLine || "", row.slug || ""),
      slug: row.slug!.trim(),
    }));
}

export const getSitemapGroups = cache(async (): Promise<SitemapGroup[]> => {
  const [blogs, pages] = await Promise.all([
    loadBlogs().catch(() => []),
    loadPages().catch(() => []),
  ]);

  return buildSitemapGroups({ blogs, pages });
});

export const getStorefrontOrigin = cache(async (): Promise<string> => {
  const company = await getCompanyBasicInfo();
  return storefrontOrigin(company.companyDomainName);
});
