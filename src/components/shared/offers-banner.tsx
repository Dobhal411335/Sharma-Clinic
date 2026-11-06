import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function OffersBanner() {
  return (
    <section className="border-t border-border bg-surface">
      <div className="container-page flex flex-col gap-4 py-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Featured offers
          </p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Curated selections worth a closer look
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore seasonal highlights while stocks last. Offers update as inventory
            changes.
          </p>
        </div>
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View doctors
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
