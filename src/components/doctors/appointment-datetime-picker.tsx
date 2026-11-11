"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Clock3, Loader2 } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fetchDoctorSlots } from "@/features/doctors/create-doctor-appointment";
import type { DoctorBookableSlot } from "@/types/doctors";

type AppointmentDateTimePickerProps = {
  doctorId: string;
  value: { startsAt: string; endsAt: string } | null;
  onChange: (value: { startsAt: string; endsAt: string } | null) => void;
};

const DAY_COUNT = 45;

function clinicTodayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days));
  return utc.toISOString().slice(0, 10);
}

function formatDateShort(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${isoDate}T12:00:00+05:30`));
}

function formatDateLong(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${isoDate}T12:00:00+05:30`));
}

function formatValueLabel(value: {
  startsAt: string;
  endsAt: string;
}): string {
  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value.startsAt));
  const start = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(value.startsAt));
  const end = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(value.endsAt));
  return `${dateLabel} · ${start} – ${end}`;
}

export function AppointmentDateTimePicker({
  doctorId,
  value,
  onChange,
}: AppointmentDateTimePickerProps) {
  const today = useMemo(() => clinicTodayIso(), []);
  const dates = useMemo(
    () => Array.from({ length: DAY_COUNT }, (_, index) => addDaysIso(today, index)),
    [today],
  );

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<DoctorBookableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const next = await fetchDoctorSlots(doctorId, date);
        if (!cancelled) {
          setSlots(next);
          if (
            value &&
            !next.some(
              (slot) =>
                slot.startsAt === value.startsAt && slot.endsAt === value.endsAt,
            )
          ) {
            // Keep previous value until user picks a new slot; do not clear while browsing.
          }
        }
      } catch (err) {
        if (!cancelled) {
          setSlots([]);
          setError(err instanceof Error ? err.message : "Could not load slots");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doctorId, date, open]); // eslint-disable-line react-hooks/exhaustive-deps -- omit value/onChange

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-[#e4ddd0] bg-white px-3 text-left text-sm shadow-xs outline-none transition-colors",
            "hover:bg-[#fbf8f2] focus-visible:ring-2 focus-visible:ring-ring",
            open && "ring-2 ring-ring",
          )}
          aria-label="Select date and time"
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays
              className="size-4 shrink-0 text-[#168b91]"
              aria-hidden
            />
            <span
              className={cn(
                "truncate",
                value ? "font-medium text-[#1a2330]" : "text-[#8a8376]",
              )}
            >
              {value ? formatValueLabel(value) : "Select date and time"}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-[#8a8376] transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(100vw-2rem,28rem)] border-[#e4ddd0] bg-white p-0 shadow-lg"
      >
        <div className="flex h-72 overflow-hidden rounded-xl">
          <div className="flex w-[42%] flex-col border-r border-[#e4ddd0] bg-[#fbf8f2]">
            <div className="border-b border-[#e4ddd0] px-3 py-2">
              <p className="text-xs font-semibold tracking-wide text-[#6b7280] uppercase">
                Date
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
              {dates.map((day) => {
                const active = day === date;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setDate(day)}
                    className={cn(
                      "mb-1 flex w-full flex-col rounded-lg px-2.5 py-2 text-left transition-colors",
                      active
                        ? "bg-[#168b91] text-white"
                        : "text-[#1a2330] hover:bg-white",
                    )}
                  >
                    <span className="text-sm font-semibold">
                      {formatDateShort(day)}
                    </span>
                    <span
                      className={cn(
                        "text-[11px]",
                        active ? "text-white/80" : "text-[#8a8376]",
                      )}
                    >
                      {day === today ? "Today" : formatDateLong(day).split(",")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col bg-white">
            <div className="border-b border-[#e4ddd0] px-3 py-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#6b7280] uppercase">
                <Clock3 className="size-3.5 text-[#168b91]" aria-hidden />
                Time · {formatDateShort(date)}
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Loading…
                </div>
              ) : error ? (
                <p className="px-2 py-4 text-sm text-destructive">{error}</p>
              ) : slots.length === 0 ? (
                <p className="px-2 py-4 text-sm text-muted-foreground">
                  No free slots on this day. Pick another date.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {slots.map((slot) => {
                    const selected =
                      value?.startsAt === slot.startsAt &&
                      value?.endsAt === slot.endsAt;
                    return (
                      <button
                        key={`${slot.startsAt}-${slot.endsAt}`}
                        type="button"
                        onClick={() => {
                          onChange({
                            startsAt: slot.startsAt,
                            endsAt: slot.endsAt,
                          });
                          setOpen(false);
                        }}
                        className={cn(
                          "rounded-lg border px-2.5 py-2 text-left text-sm font-medium transition-colors",
                          selected
                            ? "border-[#168b91] bg-[#d9ecee] text-[#12757a]"
                            : "border-[#e4ddd0] bg-[#fbf8f2] hover:border-[#168b91]/50",
                        )}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
