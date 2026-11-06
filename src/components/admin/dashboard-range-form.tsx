"use client";

import { RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseDashboardRange } from "@/features/reports/dashboard-range";

const fieldClass =
  "h-9 w-[9.25rem] rounded-lg border-[#e6eaee] bg-white px-2.5 text-sm text-[#1a1d21] shadow-xs";

export function DashboardRangeForm() {
  const params = useSearchParams();
  const range = parseDashboardRange({
    from: params.get("from") ?? undefined,
    to: params.get("to") ?? undefined,
  });

  return (
    <form
      key={`${range.from}:${range.to}`}
      method="get"
      className="flex flex-wrap items-center gap-2"
    >
      <label htmlFor="dashboard-from" className="text-sm text-[#667085]">
        From
      </label>
      <Input
        id="dashboard-from"
        name="from"
        type="date"
        defaultValue={range.from}
        required
        className={fieldClass}
      />
      <label htmlFor="dashboard-to" className="text-sm text-[#667085]">
        To
      </label>
      <Input
        id="dashboard-to"
        name="to"
        type="date"
        defaultValue={range.to}
        required
        className={fieldClass}
      />
      <Button
        type="submit"
        variant="outline"
        className="h-9 rounded-lg border-[#e6eaee] bg-white px-3 text-[#1a1d21] shadow-xs hover:bg-[#f7f8f9]"
      >
        <RefreshCw className="size-4" strokeWidth={1.5} />
        Refresh
      </Button>
    </form>
  );
}
