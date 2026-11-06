import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { formatBlogDate, getLandingBlogs } from "@/features/blog/blog.service";
import type { LandingPost } from "@/data/landing";
import { exampleAuthor, placeholderImage } from "@/data/site";
import { insightsIntro } from "@/data/landing";

function toLandingPost(blog: {
  id: string;
  slug: string;
  title: string;
  category: string;
  badgeText?: string;
  stat1Number?: string;
  stat1Name?: string;
  stat1Text?: string;
  stat2Number?: string;
  stat2Name?: string;
  stat2Text?: string;
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
    stats: [
      { number: blog.stat1Number?.trim() || "", name: blog.stat1Name?.trim() || "", text: blog.stat1Text?.trim() || undefined },
      { number: blog.stat2Number?.trim() || "", name: blog.stat2Name?.trim() || "", text: blog.stat2Text?.trim() || undefined },
    ].filter((stat) => stat.number || stat.name || stat.text),
    date: formatBlogDate(blog.publishedAt),
    author: blog.createdBy || exampleAuthor,
    image: blog.imageUrl || placeholderImage.blogCard,
    alt: blog.title,
    href: `/blog/${blog.slug}`,
  };
}

function EditorialBlogCard({ post, featured = false }: { post: LandingPost; featured?: boolean }) {
  return (
    <Link
      href={post.href}
      className={`group relative isolate flex min-h-[16rem] overflow-hidden rounded-[20px] bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${featured ? "lg:row-span-2 lg:min-h-[34rem]" : ""}`}
    >
      <Image
        src={post.image}
        alt={post.alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes={featured ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 100vw, 50vw"}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#07151d]/95 via-[#07151d]/25 to-transparent"
      />
      <div className="relative z-10 mt-auto flex max-w-2xl flex-col items-start gap-2 p-5 text-white sm:p-7">
        {post.badgeText ? (
          <span className="rounded-full bg-white/15 px-3 py-3 text-[11px] font-bold tracking-[0.14em] uppercase backdrop-blur-sm">
            {post.badgeText}
          </span>
        ) : null}
        <h3
          className={`font-display font-semibold leading-tight tracking-tight ${featured ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl"}`}
        >
          {post.title}
        </h3>
        {featured ? (
          <p className="line-clamp-2 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            {post.excerpt}
          </p>
        ) : null}
        {post.stats?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {post.stats.slice(0, 2).map((stat) => (
              <div
                key={`${stat.number}-${stat.name}`}
                className="min-w-[6.5rem] rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-md"
              >
                {stat.number ? (
                  <strong className="block text-xl font-semibold leading-none sm:text-xl">
                    {stat.number}
                  </strong>
                ) : null}
                {stat.name ? (
                  <span className="mt-1 block text-[12px] font-medium leading-tight text-white/75">
                    {stat.name}
                  </span>
                ) : null}
                {stat.text ? (
                  <span className="mt-1 block text-[10px] leading-tight text-white/65">
                    {stat.text}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-white/85">
          {post.date} · By {post.author}
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

export async function BlogGrid() {
  const blogs = (await getLandingBlogs(3)).slice(0, 3);

  if (blogs.length === 0) {
    return null;
  }

  return (
    <section className="container-page section-space" aria-labelledby="blog-grid-heading">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#ef6a24] uppercase">
            Our Blog
          </p>
          <h2
            id="blog-grid-heading"
            className="mt-5 max-w-2xl text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-foreground sm:text-5xl"
          >
            {insightsIntro.title}
          </h2>
          <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[#ef6a24] to-[#f0d8c9]" />
        </div>
        <Link
          href="/blog"
          className="inline-flex w-fit items-center gap-1 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary bg-primary hover:text-white transition-colors duration-300"
        >
          View all blogs
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr] lg:grid-rows-2">
        {blogs.map((blog, index) => (
          <EditorialBlogCard key={blog.id} post={toLandingPost(blog)} featured={index === 0} />
        ))}
      </div>
    </section>
  );
}
