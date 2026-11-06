"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "cn";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const TIME_SLOTS = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, "0")}:00`;
  return value;
});

type AppointmentDateTimePickerProps = {
  value: Date | null;
  onChange: (value: Date | null) => void;
  disabled?: boolean;
};

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatDisplay(value: Date | null): string {
  if (!value) return "Choose Time";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function AppointmentDateTimePicker({
  value,
  onChange,
  disabled,
}: AppointmentDateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(value ?? new Date()));
  const selectedTime = useMemo(() => {
    if (value) {
      return `${String(value.getHours()).padStart(2, "0")}:00`;
    }
    const currentHour = new Date().getHours();
    const defaultHour =
      currentHour >= 10 && currentHour < 21 ? currentHour + 1 : 10;
    return `${String(defaultHour).padStart(2, "0")}:00`;
  }, [value]);

  const days = useMemo(() => {
    const first = startOfMonth(month);
    const startOffset = first.getDay();
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
    const cells: Array<Date | null> = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(month.getFullYear(), month.getMonth(), day));
    }
    return cells;
  }, [month]);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const applySelection = (day: Date, time: string) => {
    const [hours] = time.split(":").map(Number);
    const next = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      hours ?? 10,
      0,
      0,
      0,
    );
    onChange(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-11 w-full justify-between rounded-xl border-border bg-background px-3 font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <span className="truncate">{formatDisplay(value)}</span>
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="w-[240px]">
            <div className="mb-2 flex items-center justify-between">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Previous month"
                onClick={() => setMonth((current) => addMonths(current, -1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <p className="text-sm font-semibold">
                {month.toLocaleString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Next month"
                onClick={() => setMonth((current) => addMonths(current, 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
              {WEEKDAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <span key={`empty-${index}`} className="size-8" />;
                }
                const disabledDay = day < today;
                const selected = value ? isSameDay(day, value) : false;
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={disabledDay}
                    onClick={() => applySelection(day, selectedTime)}
                    className={cn(
                      "size-8 rounded-full text-sm transition-colors",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                      disabledDay && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full border-t border-border pt-3 sm:w-28 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Time</p>
            <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
              {TIME_SLOTS.map((slot) => {
                const active = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={!value}
                    onClick={() => {
                      if (!value) return;
                      applySelection(value, slot);
                    }}
                    className={cn(
                      "flex w-full items-center justify-center rounded-lg px-2 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                      !value && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
