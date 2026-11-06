import Link from "next/link";
import type { Metadata } from "next";

import { BlogListItem } from "@/components/blog/blog-list-item";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { OffersBanner } from "@/components/shared/offers-banner";
import { pageSeo } from "@/data/site";
import { getBlogs, getRecentBlogs } from "@/features/blog/blog.service";

export const metadata: Metadata = {
  title: pageSeo.blog.title,
  description: pageSeo.blog.description,
};

type BlogPageProps = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category, q } = await searchParams;
  const query = q?.trim() ?? "";
  const [{ blogs, categories }, recent] = await Promise.all([
    getBlogs(category),
    getRecentBlogs(4),
  ]);

  const filteredBlogs = query
    ? blogs.filter((post) => {
        const haystack = `${post.title} ${post.category} ${post.description}`
          .replace(/<[^>]+>/g, " ")
          .toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : blogs;

  return (
    <>
      <div className="bg-[#f8f5ee]">
        <div className="container-page section-space py-12 sm:py-16 lg:py-20">
          <div className="mb-10 max-w-2xl">
            <nav className="text-sm font-medium text-[#7a858b]" aria-label="Breadcrumb">
              <Link
                href="/"
                className="transition-colors hover:text-[#1d262b] underline decoration-[#c97852] decoration-1 underline-offset-4"
              >
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-[#1d262b]">Blog</span>
            </nav>
            <h1 className="mt-4 text-4xl font-semibold tracking-wide text-[#1d262b] uppercase sm:text-5xl">
              Blogs
            </h1>
            <div className="mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-[#ef6a24] to-[#f0d8c9]" />
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.55fr)] lg:gap-10">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <BlogSidebar
                categories={categories}
                recent={recent}
                activeCategory={category}
                searchQuery={query}
                share={{
                  title: category ? `${category} blogs` : pageSeo.blog.title,
                  text: pageSeo.blog.shareText,
                  url: category
                    ? `/blog?category=${encodeURIComponent(category)}`
                    : "/blog",
                  toastId: "blog.share",
                  errorMessage: "Could not share this page.",
                }}
              />
            </div>

            <div className="space-y-6">
              {filteredBlogs.length === 0 ? (
                <div className="rounded-[28px] bg-white px-8 py-14 text-center shadow-[0_8px_30px_rgba(40,30,20,0.04)]">
                  <p className="text-sm text-[#6d787e]">
                    {query
                      ? "No articles match your search."
                      : category
                        ? "No articles in this category yet."
                        : "No articles published yet."}
                  </p>
                </div>
              ) : (
                filteredBlogs.map((post) => <BlogListItem key={post.id} post={post} />)
              )}
            </div>
          </div>
        </div>
      </div>
      <OffersBanner />
    </>
  );
}
