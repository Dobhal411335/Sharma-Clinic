import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { LandingPost } from "@/data/landing";

type BlogCardProps = {
  post: LandingPost;
  variant?: "carousel" | "grid" | "insight";
};

export function BlogCard({ post, variant = "carousel" }: BlogCardProps) {
  return (
    <Card className="h-full gap-0 overflow-hidden border-border py-0 shadow-none">
      <Link
        href={post.href}
        className="group flex h-full min-h-0 flex-col focus-visible:outline-none"
      >
        <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden bg-surface">
          <Image
            src={post.image}
            alt={post.alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {variant === "insight" ? (
            <Badge className="absolute rounded-md px-2 py-1 text-xs font-semibold tracking-[0.08em] text-primary uppercase top-3 left-3 bg-accent">
              {post.category}
            </Badge>
          ) : null}
          {variant === "grid" ? (
            <Badge
              variant="secondary"
              className="absolute rounded-md px-2 py-1 text-xs font-semibold tracking-[0.08em] uppercase top-3 left-3 bg-foreground text-background"
            >
              {post.category}
            </Badge>
          ) : null}
        </div>
        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          {variant !== "insight" ? (
            <p className="text-xs text-gray-900">
              {post.date} · By {post.author}
            </p>
          ) : (
            <p className="text-xs text-gray-800">
              by {post.author} | {post.date}
            </p>
          )}
          <h3 className="font-medium text-lg leading-snug font-semibold group-hover:text-primary line-clamp-2 text-ellipsis">
            {post.title}
          </h3>
          {variant === "grid" ? (
            <div dangerouslySetInnerHTML={{ __html: post.excerpt }} className="line-clamp-2 text-sm text-muted-foreground/90" />
          ) : null}
          {variant === "carousel" || variant === "grid" ? (
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium underline-offset-4 group-hover:underline">
              Read more
              <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          ) : null}
        </CardContent>
      </Link>
    </Card>
  );
}
