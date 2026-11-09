import { cache } from "react";

import {
  FALLBACK_BLOG_CATEGORIES,
  FALLBACK_BLOGS,
  getFallbackBlogBySlug,
  getFallbackRecentBlogs,
} from "@/features/blog/blog.defaults";
import type {
  StorefrontBlog,
  StorefrontBlogAccordionItem,
  StorefrontBlogCard,
  StorefrontBlogCategory,
  StorefrontBlogDetail,
  StorefrontBlogListResult,
} from "@/types/blog";

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

type ApiBlog = {
  id: string;
  slug: string;
  name: string;
  category: string;
  badgeText?: string;
  stat1Number?: string;
  stat1Name?: string;
  stat1Text?: string;
  stat2Number?: string;
  stat2Name?: string;
  stat2Text?: string;
  title: string;
  publishedAt: string;
  createdBy: string;
  imageUrl: string;
  description?: string;
  blockquote?: string;
  accordionItems?: StorefrontBlogAccordionItem[];
  createdAt?: string;
};

type ApiBlogCard = {
  id: string;
  slug: string;
  name: string;
  category: string;
  badgeText?: string;
  stat1Number?: string;
  stat1Name?: string;
  stat1Text?: string;
  stat2Number?: string;
  stat2Name?: string;
  stat2Text?: string;
  title: string;
  publishedAt: string;
  createdBy: string;
  imageUrl: string;
};

type ApiBlogDetail = ApiBlog & {
  related?: ApiBlogCard[];
};

type ApiBlogList = {
  blogs: ApiBlog[];
  categories: string[];
};

const STOREFRONT_SITE_CODE = "IN" as const;

function apiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) {
    return "";
  }
  return value.replace(/\/$/, "");
}

function preferHttps(url: string): string {
  if (url.startsWith("http://res.cloudinary.com/")) {
    return `https://${url.slice("http://".length)}`;
  }
  return url;
}

function mapAccordionItems(
  value: StorefrontBlogAccordionItem[] | undefined,
): StorefrontBlogAccordionItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => ({
      question: typeof item?.question === "string" ? item.question.trim() : "",
      description:
        typeof item?.description === "string" ? item.description.trim() : "",
    }))
    .filter((item) => item.question.length > 0 || item.description.length > 0);
}

function mapBlog(row: ApiBlog): StorefrontBlog {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    badgeText: row.badgeText || "",
    stat1Number: row.stat1Number || "",
    stat1Name: row.stat1Name || "",
    stat1Text: row.stat1Text || "",
    stat2Number: row.stat2Number || "",
    stat2Name: row.stat2Name || "",
    stat2Text: row.stat2Text || "",
    title: row.title || row.name,
    publishedAt: row.publishedAt,
    createdBy: row.createdBy || "",
    imageUrl: preferHttps(row.imageUrl || ""),
    description: row.description || "",
    blockquote: row.blockquote || "",
    accordionItems: mapAccordionItems(row.accordionItems),
    createdAt: row.createdAt || row.publishedAt,
  };
}

function mapCard(row: ApiBlogCard): StorefrontBlogCard {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    badgeText: row.badgeText || "",
    stat1Number: row.stat1Number || "",
    stat1Name: row.stat1Name || "",
    stat1Text: row.stat1Text || "",
    stat2Number: row.stat2Number || "",
    stat2Name: row.stat2Name || "",
    stat2Text: row.stat2Text || "",
    title: row.title || row.name,
    publishedAt: row.publishedAt,
    createdBy: row.createdBy || "",
    imageUrl: preferHttps(row.imageUrl || ""),
  };
}

export function formatBlogDate(value: string | undefined | null): string {
  if (!value?.trim()) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function buildBlogCategorySummaries(
  blogs: Array<{ category: string }>,
  categoryNames: string[],
): StorefrontBlogCategory[] {
  const counts = new Map<string, number>();
  for (const blog of blogs) {
    const name = blog.category.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const names =
    categoryNames.length > 0
      ? categoryNames
      : [...counts.keys()].sort((left, right) =>
          left.localeCompare(right, undefined, { sensitivity: "base" }),
        );

  return names.map((name) => {
    const exact = counts.get(name);
    if (exact != null) {
      return { name, count: exact };
    }
    const matched = [...counts.entries()].find(
      ([key]) => key.toLowerCase() === name.toLowerCase(),
    );
    return { name, count: matched?.[1] ?? 0 };
  });
}

type RemoteBlogList = {
  blogs: StorefrontBlog[];
  categories: string[];
};

async function fetchBlogList(options?: {
  category?: string;
  recent?: boolean;
  limit?: number;
}): Promise<RemoteBlogList | null> {
  try {
    const { listItems } = await import("@/features/cms/store");
    const items = (await listItems("blog")) as unknown as Array<ApiBlog & { active?: boolean }>;
    if (items.length === 0) return null;

    let blogs = items.filter((item) => item.active !== false && item.slug);
    if (options?.category) {
      const category = options.category.toLowerCase();
      blogs = blogs.filter((item) => item.category?.toLowerCase() === category);
    }
    blogs.sort((left, right) =>
      String(right.publishedAt || right.createdAt || "").localeCompare(
        String(left.publishedAt || left.createdAt || ""),
      ),
    );
    if (options?.limit) blogs = blogs.slice(0, options.limit);

    const categories = [
      ...new Set(items.map((item) => item.category).filter((name): name is string => Boolean(name))),
    ];
    return { blogs: blogs.map(mapBlog), categories };
  } catch {
    return null;
  }
}

/**
 * Blog index: active posts, optional category filter.
 * Falls back to static data only when the API is unavailable.
 */
export const getBlogs = cache(
  async (category?: string): Promise<StorefrontBlogListResult> => {
    const [remote, allRemote] = await Promise.all([
      fetchBlogList({ category }),
      category ? fetchBlogList() : Promise.resolve(null),
    ]);

    if (!remote) {
      const blogs = category
        ? FALLBACK_BLOGS.filter(
            (post) => post.category.toLowerCase() === category.toLowerCase(),
          )
        : FALLBACK_BLOGS;
      return {
        blogs,
        categories: buildBlogCategorySummaries(
          FALLBACK_BLOGS,
          FALLBACK_BLOG_CATEGORIES,
        ),
      };
    }

    const categoryNames =
      remote.categories.length > 0
        ? remote.categories
        : FALLBACK_BLOG_CATEGORIES;
    const blogsForCounts = allRemote?.blogs ?? remote.blogs;

    return {
      blogs: remote.blogs,
      categories: buildBlogCategorySummaries(blogsForCounts, categoryNames),
    };
  },
);

/**
 * Landing / sidebar recent posts (max 4).
 */
export const getRecentBlogs = cache(
  async (limit = 4): Promise<StorefrontBlogCard[]> => {
    const remote = await fetchBlogList({ recent: true, limit });
    if (!remote) {
      return getFallbackRecentBlogs(limit);
    }
    return remote.blogs.slice(0, limit).map((blog) => ({
      id: blog.id,
      slug: blog.slug,
      name: blog.name,
      category: blog.category,
      title: blog.title,
      publishedAt: blog.publishedAt,
      createdBy: blog.createdBy,
      imageUrl: blog.imageUrl,
    }));
  },
);

/**
 * Landing blog grid (first N active posts).
 */
export const getLandingBlogs = cache(async (limit = 3): Promise<StorefrontBlog[]> => {
  const remote = await fetchBlogList({ limit });
  if (!remote) {
    return FALLBACK_BLOGS.slice(0, limit);
  }
  return remote.blogs.slice(0, limit);
});

/**
 * Article detail by slug + related same-category cards.
 * Uses static fallback only when the API is unavailable (not on 404).
 */
export const getBlogBySlug = cache(
  async (slug: string): Promise<StorefrontBlogDetail | null> => {
    try {
      const { listItems } = await import("@/features/cms/store");
      const items = (await listItems("blog")) as unknown as Array<ApiBlog & { active?: boolean }>;
      if (items.length === 0) return getFallbackBlogBySlug(slug);

      const match = items.find((item) => item.slug === slug && item.active !== false);
      if (!match) return null;

      const related = items
        .filter(
          (item) =>
            item.id !== match.id &&
            item.active !== false &&
            item.category === match.category,
        )
        .slice(0, 3);

      return {
        ...mapBlog(match),
        related: related.map(mapCard),
      };
    } catch {
      return getFallbackBlogBySlug(slug);
    }
  },
);
