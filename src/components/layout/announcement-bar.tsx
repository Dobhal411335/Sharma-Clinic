"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useTopAdvertisement } from "@/providers/top-advertisement-provider";
import type { StorefrontAnnouncementItem } from "@/types/top-advertisement";

function AnnouncementText({ item }: { item: StorefrontAnnouncementItem }) {
  if (item.href) {
    return (
      <Link
        href={item.href}
        className="underline-offset-2 transition-opacity hover:underline hover:opacity-90"
      >
        {item.text}
      </Link>
    );
  }
  return <span>{item.text}</span>;
}

export function AnnouncementBar() {
  const { announcements } = useTopAdvertisement();
  const active = announcements.filter((item) => item.text.trim());
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (active.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % active.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [active.length]);

  if (active.length === 0) {
    return null;
  }

  const item = active[activeIndex % active.length]!;

  return (
    <div className="bg-secondary text-secondary-foreground">
      <div
        className="flex min-h-9 items-center justify-center overflow-hidden px-4 py-2 text-center text-xs tracking-wide sm:text-sm"
        aria-label="Announcements"
        aria-live="polite"
        role="status"
      >
        <span
          key={`${item.text}-${activeIndex}`}
          className="inline-flex animate-in fade-in duration-700 motion-reduce:animate-none"
        >
          <AnnouncementText item={item} />
        </span>
      </div>
    </div>
  );
}
