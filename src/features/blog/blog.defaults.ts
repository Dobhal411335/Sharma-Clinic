import {
  blogCategories,
  blogPosts,
  getBlogPostBySlug,
  getRecentBlogPosts,
} from "@/data/blog";
import type {
  StorefrontBlog,
  StorefrontBlogCard,
  StorefrontBlogDetail,
} from "@/types/blog";

function formatStaticDate(value: string): string {
  return value;
}

export function mapStaticPostToStorefront(
  post: (typeof blogPosts)[number],
): StorefrontBlog {
  return {
    id: post.id,
    slug: post.slug,
    name: post.title,
    category: post.category,
    title: post.title,
    publishedAt: post.date,
    createdBy: post.author,
    imageUrl: post.image,
    description: post.content.map((paragraph) => `<p>${paragraph}</p>`).join(""),
    blockquote: "",
    accordionItems: [],
    createdAt: post.date,
  };
}

export function mapStaticPostToCard(
  post: (typeof blogPosts)[number],
): StorefrontBlogCard {
  return {
    id: post.id,
    slug: post.slug,
    name: post.title,
    category: post.category,
    title: post.title,
    publishedAt: formatStaticDate(post.date),
    createdBy: post.author,
    imageUrl: post.image,
  };
}

export const FALLBACK_BLOG_CATEGORIES = [...blogCategories];

export const FALLBACK_BLOGS: StorefrontBlog[] = blogPosts.map(
  mapStaticPostToStorefront,
);

export function getFallbackBlogBySlug(slug: string): StorefrontBlogDetail | null {
  const post = getBlogPostBySlug(slug);
  if (!post) return null;

  const related = getRecentBlogPosts(4)
    .filter((entry) => entry.slug !== post.slug && entry.category === post.category)
    .slice(0, 3)
    .map(mapStaticPostToCard);

  const relatedFallback =
    related.length > 0
      ? related
      : getRecentBlogPosts(4)
          .filter((entry) => entry.slug !== post.slug)
          .slice(0, 3)
          .map(mapStaticPostToCard);

  return {
    ...mapStaticPostToStorefront(post),
    related: relatedFallback,
  };
}

export function getFallbackRecentBlogs(limit = 4): StorefrontBlogCard[] {
  return getRecentBlogPosts(limit).map(mapStaticPostToCard);
}
