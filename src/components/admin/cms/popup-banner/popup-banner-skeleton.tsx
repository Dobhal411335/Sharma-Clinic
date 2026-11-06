import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PopupBannerSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="space-y-2 border-b border-border/70">
          <div className="h-5 w-48 rounded bg-muted" />
          <div className="h-4 w-72 rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="h-40 w-full rounded-[10px] bg-muted" />
          <div className="h-11 w-full rounded-[10px] bg-muted" />
          <div className="h-11 w-2/3 rounded-[10px] bg-muted" />
          <div className="h-24 w-full rounded-[10px] bg-muted" />
          <div className="h-11 w-1/2 rounded-[10px] bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}
