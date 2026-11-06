"use client";

import Link from "next/link";
import { Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  GALLERY_DESKTOP_COLUMNS,
  GALLERY_MAX_ITEMS_PER_COLUMN,
  GALLERY_MOBILE_COLUMNS,
  packGalleryColumns,
} from "@/lib/gallery-pack";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/types/gallery";

const TEXT_CARD_TONES = [
  "bg-[#d7dde4] text-foreground",
  "bg-[#e8e0d4] text-foreground",
  "bg-[#dde6df] text-foreground",
] as const;

function optionalHref(url: string | undefined): string {
  const trimmed = url?.trim();
  if (!trimmed || trimmed === "#") return "";
  return trimmed;
}

function GalleryMedia({
  item,
  alt,
  priority = false,
  className,
}: {
  item: GalleryItem;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  if (item.mediaType === "video") {
    return (
      <video
        src={item.mediaUrl}
        className={cn("h-auto w-full rounded-2xl object-cover", className)}
        muted
        playsInline
        autoPlay
        loop
        preload="metadata"
        aria-label={alt}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- masonry needs natural media height
    <img
      src={item.mediaUrl}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("h-auto w-full rounded-2xl object-cover", className)}
    />
  );
}

function GalleryTextCard({
  item,
  toneClassName,
}: {
  item: GalleryItem;
  toneClassName: string;
}) {
  const href = optionalHref(item.buttonUrl);

  return (
    <div
      className={cn(
        "flex min-h-[14rem] flex-col justify-between rounded-2xl p-6 sm:min-h-[16rem] sm:p-7",
        toneClassName,
      )}
    >
      <div>
        <h3 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {item.heading}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70 sm:text-base">
          {item.description}
        </p>
      </div>
      {item.buttonLabel && href ? (
        <div className="mt-6">
          <Link
            href={href}
            className="inline-flex items-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            {item.buttonLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function GalleryTile({
  item,
  index,
  priority = false,
}: {
  item: GalleryItem;
  index: number;
  priority?: boolean;
}) {
  const alt = `Gallery media ${index + 1}`;
  const delayMs = Math.min(index * 45, 360);

  if (item.mediaType === "text_card") {
    return (
      <div
        role="listitem"
        className="group break-inside-avoid motion-safe:animate-[fade-up_0.55s_ease-out_both] motion-reduce:animate-none"
        style={{ animationDelay: `${delayMs}ms` }}
      >
        <GalleryTextCard
          item={item}
          toneClassName={TEXT_CARD_TONES[index % TEXT_CARD_TONES.length]!}
        />
      </div>
    );
  }

  const href = optionalHref(item.clickUrl);
  const media = (
    <div className="overflow-hidden rounded-2xl bg-surface transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.015]">
      <GalleryMedia
        item={item}
        alt={alt}
        priority={priority}
        className="rounded-2xl"
      />
    </div>
  );

  return (
    <div
      role="listitem"
      className="group break-inside-avoid motion-safe:animate-[fade-up_0.55s_ease-out_both] motion-reduce:animate-none"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {href ? (
        <Link href={href} className="block focus-visible:outline-none">
          {media}
        </Link>
      ) : (
        media
      )}
    </div>
  );
}

function PackedMasonry({
  items,
  columnCount,
  className,
}: {
  items: GalleryItem[];
  columnCount: number;
  className?: string;
}) {
  const columns = packGalleryColumns(
    items,
    columnCount,
    GALLERY_MAX_ITEMS_PER_COLUMN,
  );

  return (
    <div className={cn("flex gap-4", className)} role="list">
      {columns.map((column, columnIndex) => (
        <div key={`gallery-col-${columnIndex}`} className="flex min-w-0 flex-1 flex-col gap-4">
          {column.map((item, rowIndex) => {
            const globalIndex = rowIndex * columnCount + columnIndex;
            return (
              <GalleryTile
                key={item.id}
                item={item}
                index={globalIndex}
                priority={globalIndex < 4}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function FullscreenGallery({ items }: { items: GalleryItem[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-full gap-2 bg-secondary px-4 text-secondary-foreground shadow-sm py-5 text-lg cursor-pointer hover:underline decoration-white decoration-1 underline-offset-4"
        >
          <Camera className="size-4" />
          View gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] w-[min(96vw,72rem)] max-w-6xl overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Lookbook</DialogTitle>
        </DialogHeader>
        <div className="columns-1 gap-4 sm:columns-2 md:columns-3">
          {items.map((item, index) => (
            <div key={item.id} className="mb-4 break-inside-avoid">
              {item.mediaType === "text_card" ? (
                <GalleryTextCard
                  item={item}
                  toneClassName={TEXT_CARD_TONES[index % TEXT_CARD_TONES.length]!}
                />
              ) : item.mediaType === "video" ? (
                <video
                  src={item.mediaUrl}
                  className="h-auto w-full rounded-2xl object-cover"
                  muted
                  playsInline
                  controls
                  preload="metadata"
                  aria-label={`Gallery detail ${index + 1}`}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- fullscreen masonry uses natural height
                <img
                  src={item.mediaUrl}
                  alt={`Gallery detail ${index + 1}`}
                  className="h-auto w-full rounded-2xl object-cover"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StyleGallery({ items }: { items: GalleryItem[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <section
      className="container-page section-space"
      aria-labelledby="gallery-heading"
    >
      <div className="">
        <h2
          id="gallery-heading"
          className="font-sans text-4xl font-semibold tracking-tight"
        >
          #Lookbook Gallery
        </h2>
        <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[#ef6a24] to-[#f0d8c9]" />
      </div>

      <div className="mt-10">
        <PackedMasonry
          items={items}
          columnCount={GALLERY_MOBILE_COLUMNS}
          className="lg:hidden"
        />
        <PackedMasonry
          items={items}
          columnCount={GALLERY_DESKTOP_COLUMNS}
          className="hidden lg:flex"
        />
      </div>

      <div className="mt-8 flex justify-center">
        <FullscreenGallery items={items} />
      </div>
    </section>
  );
}
