"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchActivePopupBanner,
  isPopupBannerDismissed,
  markPopupBannerDismissed,
} from "@/features/popup-banner/popup-banner.service";
import type { StorefrontPopupBanner } from "@/types/popup-banner";

const STOREFRONT_SITE_CODE = "IN" as const;

type PromoPopupBannerProps = {
  /** Delay before opening so the page can paint first. */
  delayMs?: number;
  siteCode?: "IN" | "COM";
};

export function PromoPopupBanner({
  delayMs = 800,
  siteCode = STOREFRONT_SITE_CODE,
}: PromoPopupBannerProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const [open, setOpen] = useState(false);
  const [banner, setBanner] = useState<StorefrontPopupBanner | null>(null);

  useEffect(() => {
    if (!isLandingPage) {
      setOpen(false);
      setBanner(null);
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    async function load() {
      if (isPopupBannerDismissed(siteCode)) {
        return;
      }

      const next = await fetchActivePopupBanner(siteCode);
      if (cancelled || !next) {
        return;
      }

      setBanner(next);
      timer = window.setTimeout(() => {
        if (!cancelled) setOpen(true);
      }, delayMs);
    }

    void load();

    return () => {
      cancelled = true;
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [delayMs, isLandingPage, siteCode]);

  function dismiss(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      markPopupBannerDismissed(siteCode);
    }
  }

  if (!isLandingPage || !banner) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={dismiss}>
      <DialogContent
        showCloseButton
        className="gap-0 overflow-hidden border-border p-0 sm:max-w-3xl"
      >
        <div className="grid sm:grid-cols-2">
          <div className="relative min-h-[14rem] bg-primary/15 sm:min-h-[22rem]">
            <Image
              src={banner.imageUrl}
              alt={banner.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="flex flex-col items-center justify-center px-6 py-10 text-center sm:px-10">
            <DialogHeader className="items-center space-y-3 text-center">
              <p className="text-xs font-semibold tracking-wide uppercase opacity-90">
                {banner.miniHeading}
              </p>
              <DialogTitle className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {banner.heading}
              </DialogTitle>
              {banner.subDescription ? (
                <DialogDescription className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {banner.subDescription}
                </DialogDescription>
              ) : (
                <DialogDescription className="sr-only">Promotional popup</DialogDescription>
              )}
            </DialogHeader>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="mt-8 border border-black hover:bg-primary hover:text-white transition-colors duration-300 min-w-[12rem]"
            >
              <Link href={banner.buttonUrl} onClick={() => dismiss(false)}>
                {banner.buttonLabel}
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
