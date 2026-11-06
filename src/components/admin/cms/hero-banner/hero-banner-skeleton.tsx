import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function HeroBannerSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-2">
        <div className="h-9 w-36 rounded-md bg-muted" />
        <div className="h-9 w-36 rounded-md bg-muted" />
        <div className="h-9 w-40 rounded-md bg-muted" />
      </div>
      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="space-y-2 border-b border-border/70">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-4 w-80 rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-24 w-full rounded bg-muted" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-36 w-full rounded bg-muted" />
            <div className="h-36 w-full rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
