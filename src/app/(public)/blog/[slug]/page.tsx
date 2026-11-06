import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Quote } from "lucide-react";

import { BlogAccordion } from "@/components/blog/blog-accordion";
import { BlogRelatedSection } from "@/components/blog/blog-related-section";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import {
  formatBlogDate,
  getBlogBySlug,
  getBlogs,
  getRecentBlogs,
} from "@/features/blog/blog.service";
import { pageSeo, placeholderImage } from "@/data/site";
import { plainTextForShare } from "@/lib/share-text";

function formatBlockquoteText(value: string): string {
  const trimmed = value.trim().replace(/^["'“”]+|["'“”]+$/g, "");
  return `“${trimmed}”`;
}

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) return { title: pageSeo.articleNotFound.title };
  const description =
    post.description
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160) || post.title;
  return {
    title: post.title,
    description,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [post, list, recent] = await Promise.all([
    getBlogBySlug(slug),
    getBlogs(),
    getRecentBlogs(4),
  ]);

  if (!post) {
    notFound();
  }

  const imageSrc =
    post.imageUrl || placeholderImage.blogWide;
  const shareText =
    plainTextForShare(post.description) ||
    plainTextForShare(post.blockquote) ||
    post.title;

  return (
    <>
      <article className="bg-[#f8f5ee]">
        <div className="container-page section-space py-12 sm:py-16 lg:py-20">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.55fr)] lg:gap-10">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <BlogSidebar
                categories={list.categories}
                recent={recent}
                share={{
                  title: post.title,
                  text: shareText,
                  url: `/blog/${post.slug}`,
                  toastId: "blog.share",
                  errorMessage: "Could not share this article.",
                }}
              />
            </div>

            <div className="min-w-0 space-y-6">
              <div className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(40,30,20,0.04)] sm:p-8 lg:p-10">
                <nav
                  className="text-sm font-medium text-[#7a858b]"
                  aria-label="Breadcrumb"
                >
                  <Link
                    href="/"
                    className="transition-colors hover:text-[#1d262b] underline decoration-[#c97852] decoration-1 underline-offset-4"
                  >
                    Home
                  </Link>
                  <span className="mx-2">/</span>
                  <Link
                    href="/blog"
                    className="transition-colors hover:text-[#1d262b] underline decoration-[#c97852] decoration-1 underline-offset-4"
                  >
                    Blog
                  </Link>
                  <span className="mx-2">/</span>
                  <span className="text-[#1d262b]">{post.title}</span>
                </nav>

                <p className="mt-6 text-[11px] font-semibold tracking-[0.16em] text-[#c97852] uppercase">
                  {post.category}
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1d262b] sm:text-4xl sm:leading-tight">
                  {post.title}
                </h1>
                <p className="mt-3 text-sm tracking-wide text-[#6d787e] uppercase">
                  {formatBlogDate(post.publishedAt)}
                  {post.createdBy ? ` · ${post.createdBy}` : ""}
                </p>

                <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-md bg-[#f3ebe1]">
                  <Image
                    src={imageSrc}
                    alt={post.title}
                    fill
                    priority
                    className="rounded-md object-cover"
                    sizes="(max-width: 1024px) 100vw, 70vw"
                  />
                </div>

                {post.blockquote ? (
                  <blockquote className="mt-8 flex items-start gap-4 rounded-2xl bg-[#f7f1ea] px-6 py-7 sm:gap-5 sm:px-8 sm:py-8">
                    <Quote
                      className="mt-0.5 size-7 shrink-0 text-[#c97852] sm:size-8"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                    <p className="text-base leading-snug font-semibold text-[#1d262b] sm:text-lg">
                      {formatBlockquoteText(post.blockquote)}
                    </p>
                  </blockquote>
                ) : null}

                <BlogAccordion items={post.accordionItems} />

                {post.description ? (
                  <div
                    className="rich-html mt-8 max-w-none text-sm leading-relaxed text-[#6d787e] sm:text-base [&_a]:text-[#c97852] [&_h1]:text-[#1d262b] [&_h2]:text-[#1d262b] [&_h3]:text-[#1d262b] [&_img]:rounded-md [&_strong]:text-[#1d262b]"
                    dangerouslySetInnerHTML={{ __html: post.description }}
                  />
                ) : (
                  <p className="mt-8 text-sm text-[#6d787e]">
                    This article does not have content yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <BlogRelatedSection items={post.related} />
      </article>
    </>
  );
}
