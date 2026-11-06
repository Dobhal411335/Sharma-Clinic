import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CompanyBasicInfoSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="mt-2 h-4 w-64 rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-12 rounded-[10px] bg-muted" />
              <div className="h-12 rounded-[10px] bg-muted" />
            </div>
            <div className="h-12 rounded-[10px] bg-muted" />
            <div className="h-12 rounded-[10px] bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="h-12 rounded-[10px] bg-muted" />
            <div className="h-24 rounded-[10px] bg-muted" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="h-40 rounded-[10px] bg-muted" />
            <div className="h-40 rounded-[10px] bg-muted" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
