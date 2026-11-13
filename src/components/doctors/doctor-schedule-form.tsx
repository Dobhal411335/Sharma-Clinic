"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  formatTimeRangeAmPm,
  windowCapacityPatients,
} from "@/lib/doctor-time";
import { showError, showSuccess } from "@/lib/toast";
import { ApiError } from "@/services/api/errors";
import type {
  AvailabilityScopeValue,
  DoctorAvailabilityApplyMode,
  DoctorAvailabilityDto,
  DoctorAvailabilityPayload,
  DoctorAvailabilityWindow,
  WeekdayValue,
} from "@/types/doctors-availability";
import { WEEKDAY_VALUES } from "@/types/doctors-availability";

const WEEKDAY_LABELS: Record<WeekdayValue, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

const TABS: Array<{
  id: AvailabilityScopeValue;
  label: string;
  description: string;
}> = [
  {
    id: "FIXED",
    label: "Fixed",
    description: "Lifetime weekly hours. Stays active until you change it.",
  },
  {
    id: "TEMPORARY",
    label: "Temporary",
    description: "Applies for a limited week/month period, then expires.",
  },
  {
    id: "CUSTOM",
    label: "Custom days",
    description: "Applies only between a start and end date.",
  },
];

type DraftWindow = {
  key: string;
  startTimeLocal: string;
  endTimeLocal: string;
  slotDurationMinutes: number;
};

type DoctorScheduleFormProps = {
  initial: DoctorAvailabilityDto | null;
  isLoading?: boolean;
  onSave: (payload: DoctorAvailabilityPayload) => Promise<void>;
};

function emptyWindow(): DraftWindow {
  return {
    key: crypto.randomUUID(),
    startTimeLocal: "09:00",
    endTimeLocal: "11:00",
    slotDurationMinutes: 10,
  };
}

function emptyByDay(): Record<WeekdayValue, DraftWindow[]> {
  return Object.fromEntries(
    WEEKDAY_VALUES.map((day) => [day, [] as DraftWindow[]]),
  ) as Record<WeekdayValue, DraftWindow[]>;
}

function groupWindows(
  windows: DoctorAvailabilityDto["windows"] | undefined,
  scope: AvailabilityScopeValue,
): Record<WeekdayValue, DraftWindow[]> {
  const base = emptyByDay();
  for (const window of windows ?? []) {
    if (window.scope !== scope) continue;
    base[window.weekday].push({
      key: window.id || crypto.randomUUID(),
      startTimeLocal: window.startTimeLocal,
      endTimeLocal: window.endTimeLocal,
      slotDurationMinutes: window.slotDurationMinutes,
    });
  }
  return base;
}

function formatIsoDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function scopeSummary(
  initial: DoctorAvailabilityDto | null,
  scope: AvailabilityScopeValue,
): string {
  const rows = (initial?.windows ?? []).filter((window) => window.scope === scope);
  if (rows.length === 0) return "Not set";
  const until = rows[0]?.effectiveUntil;
  if (scope === "FIXED" || !until) return "Active (lifetime)";
  return `Active until ${formatIsoDate(until)}`;
}

export function DoctorScheduleForm({
  initial,
  isLoading = false,
  onSave,
}: DoctorScheduleFormProps) {
  const [scope, setScope] = useState<AvailabilityScopeValue>("FIXED");
  const [selectedDays, setSelectedDays] = useState<WeekdayValue[]>([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
  ]);
  const [byDay, setByDay] = useState<Record<WeekdayValue, DraftWindow[]>>(
    () => emptyByDay(),
  );
  const [applyMode, setApplyMode] =
    useState<DoctorAvailabilityApplyMode>("WEEK");
  const [repeatCount, setRepeatCount] = useState("4");
  const [untilDate, setUntilDate] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [copyFrom, setCopyFrom] = useState<WeekdayValue>("MONDAY");

  useEffect(() => {
    if (!initial) return;
    const grouped = groupWindows(initial.windows, scope);
    setByDay(grouped);
    const daysWithWindows = WEEKDAY_VALUES.filter(
      (day) => grouped[day].length > 0,
    );
    if (daysWithWindows.length > 0) {
      setSelectedDays(daysWithWindows);
      setCopyFrom(daysWithWindows[0]!);
    } else {
      setSelectedDays(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]);
      setCopyFrom("MONDAY");
    }
  }, [initial, scope]);

  const draftWindows = useMemo(() => {
    const windows: DoctorAvailabilityWindow[] = [];
    for (const day of selectedDays) {
      for (const window of byDay[day]) {
        windows.push({
          weekday: day,
          startTimeLocal: window.startTimeLocal,
          endTimeLocal: window.endTimeLocal,
          slotDurationMinutes: window.slotDurationMinutes,
        });
      }
    }
    return windows;
  }, [byDay, selectedDays]);

  const toggleDay = (day: WeekdayValue) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((item) => item !== day);
      }
      setByDay((current) => ({
        ...current,
        [day]: current[day].length > 0 ? current[day] : [emptyWindow()],
      }));
      return [...prev, day];
    });
  };

  const updateWindow = (
    day: WeekdayValue,
    key: string,
    patch: Partial<DraftWindow>,
  ) => {
    setByDay((prev) => ({
      ...prev,
      [day]: prev[day].map((window) =>
        window.key === key ? { ...window, ...patch } : window,
      ),
    }));
  };

  const addWindow = (day: WeekdayValue) => {
    setByDay((prev) => ({
      ...prev,
      [day]: [...prev[day], emptyWindow()],
    }));
  };

  const removeWindow = (day: WeekdayValue, key: string) => {
    setByDay((prev) => ({
      ...prev,
      [day]: prev[day].filter((window) => window.key !== key),
    }));
  };

  const copyDayToSelected = () => {
    const source = byDay[copyFrom];
    if (!source.length) {
      showError("Add at least one window on the source day first.");
      return;
    }
    setByDay((prev) => {
      const next = { ...prev };
      for (const day of selectedDays) {
        if (day === copyFrom) continue;
        next[day] = source.map((window) => ({
          ...window,
          key: crypto.randomUUID(),
        }));
      }
      return next;
    });
    showSuccess("Copied schedule to selected days.");
  };

  const loadFromFixed = () => {
    if (!initial) {
      showError("Save a Fixed schedule first.");
      return;
    }
    const grouped = groupWindows(initial.windows, "FIXED");
    const daysWithWindows = WEEKDAY_VALUES.filter(
      (day) => grouped[day].length > 0,
    );
    if (daysWithWindows.length === 0) {
      showError("No Fixed schedule windows to copy.");
      return;
    }
    setByDay(grouped);
    setSelectedDays(daysWithWindows);
    setCopyFrom(daysWithWindows[0]!);
    showSuccess("Loaded windows from Fixed schedule.");
  };

  const confirmSave = async () => {
    if (selectedDays.length === 0) {
      showError("Select at least one weekday.");
      return;
    }
    if (draftWindows.length === 0) {
      showError("Add at least one time window.");
      return;
    }

    const payload: DoctorAvailabilityPayload = {
      windows: draftWindows,
      scope,
      applyMode:
        scope === "FIXED"
          ? "WEEK"
          : scope === "CUSTOM"
            ? "DATE_RANGE"
            : applyMode,
      applyWeekdays: selectedDays,
      repeatCount:
        applyMode === "NEXT_WEEKS" || applyMode === "NEXT_MONTHS"
          ? Number(repeatCount)
          : undefined,
      untilDate: applyMode === "UNTIL_DATE" ? untilDate : undefined,
      rangeStart: scope === "CUSTOM" ? rangeStart : undefined,
      rangeEnd: scope === "CUSTOM" ? rangeEnd : undefined,
    };

    setSaving(true);
    try {
      await onSave(payload);
      showSuccess(
        scope === "FIXED"
          ? "Fixed schedule saved."
          : scope === "TEMPORARY"
            ? "Temporary schedule saved."
            : "Custom schedule saved.",
      );
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Could not save schedule.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading schedule…
      </div>
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Doctor schedule</CardTitle>
        <p className="text-sm text-muted-foreground">
          Set Fixed lifetime hours, Temporary periods, or Custom date ranges.
          Temporary/Custom expire without clearing Fixed.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-2 sm:grid-cols-3">
          {TABS.map((tab) => {
            const active = scope === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setScope(tab.id)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted/40",
                )}
              >
                <p className="text-sm font-semibold text-foreground">
                  {tab.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tab.description}
                </p>
                <p className="mt-2 text-xs font-medium text-primary">
                  {scopeSummary(initial, tab.id)}
                </p>
              </button>
            );
          })}
        </div>

        {scope === "TEMPORARY" ? (
          <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
            <Label>How long should this temporary schedule apply?</Label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ["WEEK", "This week only"],
                  ["MONTH", "This month only"],
                  ["NEXT_WEEKS", "Next N weeks"],
                  ["NEXT_MONTHS", "Next N months"],
                  ["UNTIL_DATE", "Until a date"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setApplyMode(mode)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-sm",
                    applyMode === mode
                      ? "border-primary bg-primary/10 font-semibold"
                      : "border-border",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {applyMode === "NEXT_WEEKS" || applyMode === "NEXT_MONTHS" ? (
              <div className="max-w-xs space-y-1.5">
                <Label htmlFor="repeat-count">
                  {applyMode === "NEXT_WEEKS" ? "Number of weeks" : "Number of months"}
                </Label>
                <Input
                  id="repeat-count"
                  type="number"
                  min={1}
                  max={applyMode === "NEXT_WEEKS" ? 52 : 24}
                  value={repeatCount}
                  onChange={(event) => setRepeatCount(event.target.value)}
                />
              </div>
            ) : null}
            {applyMode === "UNTIL_DATE" ? (
              <div className="max-w-xs space-y-1.5">
                <Label htmlFor="until-date">Until date</Label>
                <Input
                  id="until-date"
                  type="date"
                  value={untilDate}
                  onChange={(event) => setUntilDate(event.target.value)}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {scope === "CUSTOM" ? (
          <div className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="range-start">Start date</Label>
              <Input
                id="range-start"
                type="date"
                value={rangeStart}
                onChange={(event) => setRangeStart(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="range-end">End date</Label>
              <Input
                id="range-end"
                type="date"
                value={rangeEnd}
                onChange={(event) => setRangeEnd(event.target.value)}
              />
            </div>
          </div>
        ) : null}

        {scope !== "FIXED" ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={loadFromFixed}>
              Load from Fixed
            </Button>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label>Active weekdays</Label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_VALUES.map((day) => {
              const active = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-white text-muted-foreground hover:text-foreground",
                  )}
                >
                  {WEEKDAY_LABELS[day].slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="copy-from-day">Copy from</Label>
            <select
              id="copy-from-day"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={copyFrom}
              onChange={(event) =>
                setCopyFrom(event.target.value as WeekdayValue)
              }
            >
              {selectedDays.map((day) => (
                <option key={day} value={day}>
                  {WEEKDAY_LABELS[day]}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" variant="outline" onClick={copyDayToSelected}>
            <Copy className="size-4" aria-hidden />
            Copy to other selected days
          </Button>
        </div>

        <div className="space-y-5">
          {selectedDays.map((day) => (
            <div key={day} className="rounded-xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-semibold text-foreground">
                  {WEEKDAY_LABELS[day]}
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addWindow(day)}
                >
                  <Plus className="size-4" aria-hidden />
                  Add window
                </Button>
              </div>
              <div className="space-y-3">
                {byDay[day].length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No windows yet. Add a morning, afternoon or evening slot.
                  </p>
                ) : (
                  byDay[day].map((window) => {
                    const capacity = windowCapacityPatients(
                      window.startTimeLocal,
                      window.endTimeLocal,
                      window.slotDurationMinutes,
                    );
                    return (
                      <div
                        key={window.key}
                        className="grid gap-3 rounded-lg bg-muted/30 p-3 sm:grid-cols-[1fr_1fr_7rem_auto]"
                      >
                        <div className="space-y-1.5">
                          <Label>Start</Label>
                          <Input
                            type="time"
                            value={window.startTimeLocal}
                            onChange={(event) =>
                              updateWindow(day, window.key, {
                                startTimeLocal: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>End</Label>
                          <Input
                            type="time"
                            value={window.endTimeLocal}
                            onChange={(event) =>
                              updateWindow(day, window.key, {
                                endTimeLocal: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Mins / patient</Label>
                          <Input
                            type="number"
                            min={5}
                            max={240}
                            value={window.slotDurationMinutes}
                            onChange={(event) =>
                              updateWindow(day, window.key, {
                                slotDurationMinutes:
                                  Number(event.target.value) || 5,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            aria-label="Remove window"
                            onClick={() => removeWindow(day, window.key)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                        <p className="sm:col-span-4 text-xs text-muted-foreground">
                          {formatTimeRangeAmPm(
                            window.startTimeLocal,
                            window.endTimeLocal,
                          )}
                          {" · "}
                          {window.slotDurationMinutes} min → about {capacity}{" "}
                          patient
                          {capacity === 1 ? "" : "s"}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>

        <Button type="button" disabled={saving} onClick={() => void confirmSave()}>
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            `Save ${TABS.find((tab) => tab.id === scope)?.label ?? "schedule"}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
