"use client";

import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { shareContent, type ShareContentInput } from "@/lib/share";
import { cn } from "@/lib/utils";

type ShareButtonProps = {
  share: ShareContentInput;
  label?: string;
  className?: string;
  iconClassName?: string;
  /** `icon` / `ghost-icon` = icon only; `labeled` = icon + visible Share text. */
  variant?: "icon" | "ghost-icon" | "labeled";
};

export function ShareButton({
  share,
  label = "Share",
  className,
  iconClassName,
  variant = "ghost-icon",
}: ShareButtonProps) {
  if (variant === "labeled") {
    return (
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "h-auto gap-2 px-0 py-1 text-foreground hover:bg-transparent hover:text-primary",
          className,
        )}
        aria-label={label}
        onClick={() => void shareContent(share)}
      >
        <Share2 className={cn("size-5 shrink-0", iconClassName)} aria-hidden />
        <span className="text-sm font-medium">Share</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant === "icon" ? "outline" : "ghost"}
      size="icon"
      className={cn(variant === "icon" ? "size-11" : "size-8", className)}
      aria-label={label}
      onClick={() => void shareContent(share)}
    >
      <Share2
        className={cn("size-4", variant === "icon" && "size-5", iconClassName)}
        aria-hidden
      />
    </Button>
  );
}
