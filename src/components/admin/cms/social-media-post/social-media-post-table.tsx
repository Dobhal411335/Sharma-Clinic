"use client";

import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Link2,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";

import {
  FacebookIcon,
  InstagramIcon,
} from "@/components/admin/cms/social-media-post/social-platform-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SocialPostDto, SocialPostType } from "@/types/admin/social-media-post";

type SocialMediaPostTableProps = {
  posts: SocialPostDto[];
  activeTab: SocialPostType;
  onEdit: (post: SocialPostDto) => void;
  onDelete: (post: SocialPostDto) => void;
  onToggleActive: (post: SocialPostDto) => void;
  onMove: (post: SocialPostDto, direction: "up" | "down") => void;
};

export function SocialMediaPostTable({
  posts,
  activeTab,
  onEdit,
  onDelete,
  onToggleActive,
  onMove,
}: SocialMediaPostTableProps) {
  const sorted = [...posts].sort(
    (left, right) => (left.order || 0) - (right.order || 0),
  );
  const platformLabel = activeTab === "instagram" ? "Instagram" : "Facebook";

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border/70 pb-5">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">
            Existing {platformLabel} Posts
          </CardTitle>
        </div>
        <CardDescription>
          Review, reorder, and manage visibility for embedded posts.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="w-14 px-4 py-3 text-center font-medium">#</th>
                <th className="w-28 px-3 py-3 text-center font-medium">Thumbnail</th>
                <th className="px-3 py-3 font-medium">Post Link</th>
                <th className="w-28 px-3 py-3 text-center font-medium">Order</th>
                <th className="w-28 px-3 py-3 text-center font-medium">Status</th>
                <th className="w-40 px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length > 0 ? (
                sorted.map((post, index) => (
                  <tr
                    key={post.id}
                    className="border-b border-border/70 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-4 text-center text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-3 py-4">
                      <div className="relative mx-auto size-16 overflow-hidden rounded-lg border border-border bg-muted/40">
                        {post.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary thumbnails
                          <img
                            src={post.imageUrl}
                            alt={`${platformLabel} thumbnail`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/50" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      {post.postUrl ? (
                        <a
                          href={post.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex max-w-sm items-center gap-1 truncate text-sm text-primary hover:underline"
                          title={post.postUrl}
                        >
                          <Link2 className="size-3.5 shrink-0" />
                          {post.postUrl}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No link provided
                        </span>
                      )}
                      <div className="mt-2">
                        <Badge
                          variant="secondary"
                          className={
                            post.postType === "instagram"
                              ? "border border-pink-100 bg-pink-50 text-pink-700"
                              : "border border-blue-100 bg-blue-50 text-blue-700"
                          }
                        >
                          {post.postType === "instagram" ? (
                            <InstagramIcon className="mr-1 size-3" />
                          ) : (
                            <FacebookIcon className="mr-1 size-3" />
                          )}
                          {post.postType === "instagram" ? "Instagram" : "Facebook"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          disabled={index === 0}
                          onClick={() => onMove(post, "up")}
                          aria-label="Move post up"
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <span className="min-w-6 font-medium">{post.order}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          disabled={index === sorted.length - 1}
                          onClick={() => onMove(post, "down")}
                          aria-label="Move post down"
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleActive(post)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                          post.active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {post.active ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9"
                          onClick={() => onEdit(post)}
                          aria-label="Edit post"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onDelete(post)}
                          aria-label="Delete post"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No {activeTab} posts found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
