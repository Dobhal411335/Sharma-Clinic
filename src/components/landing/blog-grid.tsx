import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { formatBlogDate, getLandingBlogs } from "@/features/blog/blog.service";
import type { LandingPost } from "@/data/landing";
import { exampleAuthor, placeholderImage } from "@/data/site";

function toLandingPost(blog: {
  id: string;
  slug: string;
  title: string;
  category: string;
  badgeText?: string;
  publishedAt: string;
  createdBy: string;
  imageUrl: string;
  description?: string;
}): LandingPost {
  const excerpt =
    blog.description
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 140) || "";

  return {
    id: blog.id,
    title: blog.title,
    excerpt,
    category: blog.category,
    badgeText: blog.badgeText?.trim() || undefined,
    date: formatBlogDate(blog.publishedAt),
    author: blog.createdBy || exampleAuthor,
    image: blog.imageUrl || placeholderImage.blogCard,
    alt: blog.title,
    href: `/blog/${blog.slug}`,
  };
}

function DateBadge({
  date,
  tone = "light",
}: {
  date: string;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
        tone === "light"
          ? "bg-white text-[#1d2b33] shadow-sm"
          : "bg-[#eef2f4] text-[#3d4d56]",
      ].join(" ")}
    >
      <span className="size-1.5 rounded-full bg-primary" aria-hidden />
      {date}
    </span>
  );
}

function FeaturedBlogCard({ post }: { post: LandingPost }) {
  return (
    <Link
      href={post.href}
      className="group relative isolate flex min-h-[28rem] overflow-hidden rounded-[28px] bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:h-full lg:min-h-[36rem]"
    >
      <Image
        src={post.image}
        alt={post.alt}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        sizes="(max-width: 1024px) 100vw, 42vw"
        priority
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#07151d]/92 via-[#07151d]/35 to-transparent transition-opacity duration-500 group-hover:via-[#07151d]/45"
      />
      <div className="relative z-10 mt-auto flex max-w-xl flex-col items-start gap-3 p-6 text-white sm:p-8">
        {post.date ? <DateBadge date={post.date} tone="light" /> : null}
        <h3 className="text-2xl font-semibold leading-tight tracking-tight transition-transform duration-500 group-hover:-translate-y-0.5 sm:text-3xl lg:text-[2rem]">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-white/80 sm:text-[15px]">
            {post.excerpt}
          </p>
        ) : null}
        <span className="mt-1 inline-flex translate-y-2 items-center gap-1.5 text-sm font-semibold text-white/90 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Read article
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function CompactBlogCard({ post, index }: { post: LandingPost; index: number }) {
  return (
    <Link
      href={post.href}
      className="group flex min-h-[13.5rem] flex-col gap-4 rounded-[28px] border bg-transparent p-4 transition-all duration-300 ease-out hover:-translate-y-1 border-gray-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:min-h-[15rem] sm:flex-row sm:items-stretch sm:gap-5 sm:p-5"
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 py-1 sm:pr-1">
        {post.date ? <DateBadge date={post.date} tone="dark" /> : null}
        <h3 className="line-clamp-2 text-xl font-semibold leading-snug tracking-tight text-[#18252b] transition-colors duration-300 group-hover:text-primary sm:text-2xl">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-[#667681]">
            {post.excerpt}
          </p>
        ) : null}
      </div>
      <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-[20px] sm:h-auto sm:w-[42%] sm:min-h-[12rem]">
        <Image
          src={post.image}
          alt={post.alt}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 22vw"
        />
      </div>
    </Link>
  );
}

export async function BlogGrid() {
  const blogs = (await getLandingBlogs(4)).slice(0, 4);

  if (blogs.length === 0) {
    return null;
  }

  const posts = blogs.map(toLandingPost);
  const [featured, ...rest] = posts;

  return (
    <section
      className="container-page section-space"
      aria-labelledby="blog-grid-heading"
    >
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold italic tracking-wide text-primary">
            Latest Blog
          </p>
          <h2
            id="blog-grid-heading"
            className="mt-2 max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#18252b] sm:text-4xl lg:text-[2.75rem]"
          >
            Stay Informed With Our Latest Health Blogs
          </h2>
        </div>
        <Link
          href="/blog"
          className="group inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_10px_24px_rgba(22,139,145,.28)]"
        >
          View All Post
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.15fr] lg:items-stretch">
        {featured ? <FeaturedBlogCard post={featured} /> : null}
        <div className="flex flex-col gap-4">
          {rest.map((post, index) => (
            <CompactBlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
