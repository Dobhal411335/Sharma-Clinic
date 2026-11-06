export function PromoCollectionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-72 rounded-lg bg-muted" />
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={`promo-collection-skeleton-${index}`}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-4 h-5 w-48 rounded bg-muted" />
          <div className="space-y-3">
            <div className="h-10 rounded bg-muted" />
            <div className="h-36 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
