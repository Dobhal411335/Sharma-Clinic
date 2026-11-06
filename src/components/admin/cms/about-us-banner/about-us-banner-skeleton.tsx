export function AboutUsBannerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`about-us-skeleton-${index}`}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-4 h-5 w-48 rounded bg-muted" />
          <div className="space-y-3">
            <div className="h-10 rounded bg-muted" />
            <div className="h-10 rounded bg-muted" />
            <div className="h-24 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
