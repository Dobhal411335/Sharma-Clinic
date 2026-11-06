"use client";

import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Pencil,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CustomerReviewDto } from "@/types/admin/customer-review";

type CustomerReviewTableProps = {
  reviews: CustomerReviewDto[];
  onEdit: (review: CustomerReviewDto) => void;
  onDelete: (review: CustomerReviewDto) => void;
  onToggleActive: (review: CustomerReviewDto) => void;
  onMove: (review: CustomerReviewDto, direction: "up" | "down") => void;
};

export function CustomerReviewTable({
  reviews,
  onEdit,
  onDelete,
  onToggleActive,
  onMove,
}: CustomerReviewTableProps) {
  const sorted = [...reviews].sort(
    (left, right) => (left.order || 0) - (right.order || 0),
  );

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border/70 pb-5">
        <div className="flex items-center gap-2">
          <UserRound className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">
            Existing Customer Reviews
          </CardTitle>
        </div>
        <CardDescription>
          Reorder, edit, and control storefront visibility for testimonials.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="w-14 px-4 py-3 text-center font-medium">#</th>
                <th className="w-28 px-3 py-3 text-center font-medium">Photo</th>
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="w-28 px-3 py-3 text-center font-medium">Rating</th>
                <th className="w-28 px-3 py-3 text-center font-medium">Order</th>
                <th className="w-28 px-3 py-3 text-center font-medium">Status</th>
                <th className="w-40 px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length > 0 ? (
                sorted.map((review, index) => (
                  <tr
                    key={review.id}
                    className="border-b border-border/70 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-4 text-center text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-3 py-4">
                      <div className="relative mx-auto size-14 overflow-hidden rounded-full border border-border bg-muted/40">
                        {review.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary thumbnails
                          <img
                            src={review.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/50" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-medium">{review.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {review.designation}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {review.description}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-medium">
                        <Star className="size-3.5 fill-foreground" />
                        {review.rating}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          disabled={index === 0}
                          onClick={() => onMove(review, "up")}
                          aria-label="Move up"
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <span className="w-6 text-center">{review.order}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          disabled={index === sorted.length - 1}
                          onClick={() => onMove(review, "down")}
                          aria-label="Move down"
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <button type="button" onClick={() => onToggleActive(review)}>
                        <Badge variant={review.active ? "default" : "secondary"}>
                          {review.active ? "Active" : "Hidden"}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={() => onEdit(review)}
                          aria-label="Edit review"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8 text-destructive"
                          onClick={() => onDelete(review)}
                          aria-label="Delete review"
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
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    No customer reviews yet. Add the first testimonial above.
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
