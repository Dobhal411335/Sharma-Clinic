import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { placeholderImage } from "@/data/site";
import type { StorefrontBlog } from "@/types/blog";

type BlogListItemProps = {
  post: StorefrontBlog;
};

function excerptFromHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function estimateReadMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function BlogListItem({ post }: BlogListItemProps) {
  const excerpt = excerptFromHtml(post.description);
  const imageSrc =
    post.imageUrl || placeholderImage.blogCard;
  const readMinutes = estimateReadMinutes(post.description || post.title);

  return (
    <article className="overflow-hidden rounded-[28px] bg-white shadow-[0_8px_30px_rgba(40,30,20,0.04)]">
      <div className="grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <Link
          href={`/blog/${post.slug}`}
          className="relative block aspect-[4/3] overflow-hidden bg-[#f3ebe1] md:aspect-auto md:min-h-[260px]"
        >
          <Image
            src={imageSrc}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </Link>

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-9">
          <div className="flex items-center justify-between gap-3 text-[11px] font-semibold tracking-[0.16em] text-[#c97852] uppercase">
            <span>{post.category || "Blog"}</span>
            <span>{readMinutes} min read</span>
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[#1d262b] sm:text-[1.75rem] sm:leading-tight">
            <Link
              href={`/blog/${post.slug}`}
              className="transition-colors hover:text-[#c97852] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c97852]"
            >
              {post.title}
            </Link>
          </h2>

          {excerpt ? (
            <p className="mt-4 text-sm leading-relaxed text-[#6d787e] sm:text-[15px]">
              {excerpt}
              {excerpt.length >= 180 ? "…" : ""}
            </p>
          ) : null}

          <Link
            href={`/blog/${post.slug}`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#c97852] transition-colors hover:text-[#b56742] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c97852]"
          >
            Read the article
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
