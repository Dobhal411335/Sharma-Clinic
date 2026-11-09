"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DoctorAvailabilityApplyMode,
  DoctorAvailabilityDto,
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

type DraftWindow = {
  key: string;
  startTimeLocal: string;
  endTimeLocal: string;
  slotDurationMinutes: number;
};

type DoctorScheduleFormProps = {
  initial: DoctorAvailabilityDto | null;
  isLoading?: boolean;
  onSave: (payload: {
    windows: DoctorAvailabilityWindow[];
    applyMode: DoctorAvailabilityApplyMode;
    applyWeekdays: WeekdayValue[];
  }) => Promise<void>;
};

function emptyWindow(): DraftWindow {
  return {
    key: crypto.randomUUID(),
    startTimeLocal: "09:00",
    endTimeLocal: "11:00",
    slotDurationMinutes: 10,
  };
}

function groupInitial(
  windows: DoctorAvailabilityDto["windows"] | undefined,
): Record<WeekdayValue, DraftWindow[]> {
  const base = Object.fromEntries(
    WEEKDAY_VALUES.map((day) => [day, [] as DraftWindow[]]),
  ) as Record<WeekdayValue, DraftWindow[]>;

  for (const window of windows ?? []) {
    base[window.weekday].push({
      key: window.id || crypto.randomUUID(),
      startTimeLocal: window.startTimeLocal,
      endTimeLocal: window.endTimeLocal,
      slotDurationMinutes: window.slotDurationMinutes,
    });
  }
  return base;
}

export function DoctorScheduleForm({
  initial,
  isLoading = false,
  onSave,
}: DoctorScheduleFormProps) {
  const [selectedDays, setSelectedDays] = useState<WeekdayValue[]>([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
  ]);
  const [byDay, setByDay] = useState<Record<WeekdayValue, DraftWindow[]>>(
    () => groupInitial(undefined),
  );
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyMode, setApplyMode] = useState<DoctorAvailabilityApplyMode>("WEEK");
  const [applyWeekdays, setApplyWeekdays] = useState<WeekdayValue[]>([]);
  const [saving, setSaving] = useState(false);
  const [copyFrom, setCopyFrom] = useState<WeekdayValue>("MONDAY");

  useEffect(() => {
    if (!initial) return;
    const grouped = groupInitial(initial.windows);
    setByDay(grouped);
    const daysWithWindows = WEEKDAY_VALUES.filter((day) => grouped[day].length > 0);
    if (daysWithWindows.length > 0) {
      setSelectedDays(daysWithWindows);
      setCopyFrom(daysWithWindows[0]!);
    }
  }, [initial]);

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

  const openApplyDialog = () => {
    if (selectedDays.length === 0) {
      showError("Select at least one weekday.");
      return;
    }
    if (draftWindows.length === 0) {
      showError("Add at least one time window.");
      return;
    }
    setApplyWeekdays(selectedDays);
    setApplyMode("WEEK");
    setApplyOpen(true);
  };

  const confirmSave = async () => {
    setSaving(true);
    try {
      await onSave({
        windows: draftWindows,
        applyMode,
        applyWeekdays,
      });
      setApplyOpen(false);
      showSuccess("Schedule saved.");
    } catch (error) {
      showError(error instanceof ApiError ? error.message : "Could not save schedule.");
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
    <>
      <Card className="border-border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Doctor schedule</CardTitle>
          <p className="text-sm text-muted-foreground">
            Set day-wise windows and appointment length per window. Capacity is
            calculated automatically.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
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
                onChange={(event) => setCopyFrom(event.target.value as WeekdayValue)}
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
                  <Button type="button" size="sm" variant="outline" onClick={() => addWindow(day)}>
                    <Plus className="size-4" aria-hidden />
                    Add window
                  </Button>
                </div>
                <div className="space-y-3">
                  {byDay[day].length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No windows yet. Add a morning or evening slot.
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
                                  slotDurationMinutes: Number(event.target.value) || 5,
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
                            {formatTimeRangeAmPm(window.startTimeLocal, window.endTimeLocal)}
                            {" · "}
                            {window.slotDurationMinutes} min → about {capacity} patient
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

          <Button type="button" onClick={openApplyDialog}>
            Save schedule
          </Button>
        </CardContent>
      </Card>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply this schedule</DialogTitle>
            <DialogDescription>
              Choose whether this weekly pattern applies open-ended or for the current month.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setApplyMode("WEEK")}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm",
                  applyMode === "WEEK"
                    ? "border-primary bg-primary/10"
                    : "border-border",
                )}
              >
                <p className="font-semibold">Weekly pattern</p>
                <p className="mt-1 text-muted-foreground">
                  Recurring from today with no end date.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setApplyMode("MONTH")}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm",
                  applyMode === "MONTH"
                    ? "border-primary bg-primary/10"
                    : "border-border",
                )}
              >
                <p className="font-semibold">Whole month</p>
                <p className="mt-1 text-muted-foreground">
                  Same weekly pattern for the current calendar month.
                </p>
              </button>
            </div>

            <div className="space-y-2">
              <Label>Apply on these days</Label>
              <div className="flex flex-wrap gap-2">
                {selectedDays.map((day) => {
                  const active = applyWeekdays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() =>
                        setApplyWeekdays((prev) =>
                          active
                            ? prev.filter((item) => item !== day)
                            : [...prev, day],
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {WEEKDAY_LABELS[day].slice(0, 3)}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Uncheck a day here to exclude it from the saved pattern (e.g. skip Saturday).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setApplyOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={() => void confirmSave()}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Confirm & save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
