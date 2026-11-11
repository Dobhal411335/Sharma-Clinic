"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { showError, showSuccess } from "@/lib/toast";
import {
  fetchAdminBooking,
  fetchAdminBookings,
  patchAdminBookingStatus,
} from "@/services/api/admin-bookings";
import { ApiError } from "@/services/api/errors";
import type {
  BookingOrderDetail,
  BookingOrderListItem,
  BookingOrderSummary,
  BookingStatusUpdate,
} from "@/types/admin/booking-order";

function clinicTodayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatInr(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "ACCEPTED":
    case "PAID":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "PENDING":
    case "PENDING_PAYMENT":
    case "ORDER_CREATED":
    case "CREATED":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "DECLINED":
    case "FAILED":
    case "CANCELLED":
    case "EXPIRED":
      return "border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

const emptySummary: BookingOrderSummary = {
  todayCount: 0,
  paidCount: 0,
  pendingAcceptanceCount: 0,
  declinedCount: 0,
  pendingPaymentCount: 0,
};

export function BookingOrderPage() {
  const [date, setDate] = useState(clinicTodayIso);
  const [status, setStatus] = useState("ALL");
  const [doctorId, setDoctorId] = useState("ALL");
  const [items, setItems] = useState<BookingOrderListItem[]>([]);
  const [summary, setSummary] = useState<BookingOrderSummary>(emptySummary);
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [viewItem, setViewItem] = useState<BookingOrderDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [actionStatus, setActionStatus] =
    useState<BookingStatusUpdate>("PENDING");
  const [declineReason, setDeclineReason] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAdminBookings({
        date,
        status,
        doctorId: doctorId === "ALL" ? undefined : doctorId,
      });
      setItems(data.items);
      setSummary(data.summary);
      setDoctors(data.doctors);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Failed to load bookings";
      setLoadError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  }, [date, status, doctorId]);

  useEffect(() => {
    void load();
  }, [load]);

  const cards = useMemo(
    () => [
      { label: "Today’s bookings", value: summary.todayCount },
      { label: "Paid", value: summary.paidCount },
      { label: "Pending acceptance", value: summary.pendingAcceptanceCount },
      { label: "Declined", value: summary.declinedCount },
      { label: "Pending payment", value: summary.pendingPaymentCount },
    ],
    [summary],
  );

  const openView = async (id: string) => {
    setViewLoading(true);
    try {
      const detail = await fetchAdminBooking(id);
      setViewItem(detail);
      const nextStatus: BookingStatusUpdate =
        detail.appointmentStatus === "ACCEPTED" ||
        detail.appointmentStatus === "DECLINED" ||
        detail.appointmentStatus === "PENDING"
          ? detail.appointmentStatus
          : "PENDING";
      setActionStatus(nextStatus);
      setDeclineReason(detail.cancellationReason ?? "");
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Failed to load booking",
      );
    } finally {
      setViewLoading(false);
    }
  };

  const saveStatus = async () => {
    if (!viewItem) return;
    setSaving(true);
    try {
      const updated = await patchAdminBookingStatus(viewItem.id, {
        status: actionStatus,
        reason:
          actionStatus === "DECLINED" ? declineReason.trim() || undefined : undefined,
      });
      setViewItem(updated);
      showSuccess(
        actionStatus === "ACCEPTED"
          ? "Appointment accepted"
          : actionStatus === "DECLINED"
            ? "Appointment declined"
            : "Status updated",
      );
      await load();
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Failed to update status",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminAppShell>
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl bg-white px-4 py-3 ring-1 ring-[#e4e7eb]"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-[#626a73]">
                {card.label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#1f2937]">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 ring-1 ring-[#e4e7eb]">
          <div className="space-y-1.5">
            <Label htmlFor="booking-date">Date</Label>
            <Input
              id="booking-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-[160px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="PENDING_PAYMENT">Pending payment</SelectItem>
                <SelectItem value="PENDING">Pending acceptance</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="DECLINED">Declined</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Doctor</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All doctors</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="outline" onClick={() => void load()}>
            Refresh
          </Button>
        </div>

        {loadError ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load bookings</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-[#e4e7eb]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#eef0f2] bg-[#fafbfc] text-xs uppercase tracking-wide text-[#626a73]">
              <tr>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Doctor</th>
                <th className="px-4 py-3 font-medium">Slot</th>
                <th className="px-4 py-3 font-medium">Fee</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#626a73]">
                    Loading bookings…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#626a73]">
                    No bookings for these filters.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-[#f1f3f5] last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1f2937]">
                        {item.patientName}
                      </div>
                      <div className="text-xs text-[#626a73]">
                        {item.patientEmail}
                        {item.patientPhone ? ` · ${item.patientPhone}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.doctorName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatWhen(item.startsAt)}
                    </td>
                    <td className="px-4 py-3">
                      {formatInr(item.feeSnapshotPaise)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={statusBadgeClass(item.paymentStatus)}
                      >
                        {item.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={statusBadgeClass(item.appointmentStatus)}
                      >
                        {item.appointmentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={viewLoading}
                        onClick={() => void openView(item.id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={Boolean(viewItem)}
        onOpenChange={(open) => {
          if (!open) setViewItem(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Booking details</DialogTitle>
            <DialogDescription>
              {viewItem
                ? `Reference ${viewItem.bookingReference}`
                : "Appointment details"}
            </DialogDescription>
          </DialogHeader>

          {viewItem ? (
            <div className="space-y-5 text-sm">
              <section className="space-y-1">
                <h3 className="font-semibold text-[#1f2937]">Patient</h3>
                <p>{viewItem.patientName}</p>
                <p className="text-[#626a73]">{viewItem.patientEmail}</p>
                {viewItem.patientPhone ? (
                  <p className="text-[#626a73]">{viewItem.patientPhone}</p>
                ) : null}
              </section>

              <section className="space-y-1">
                <h3 className="font-semibold text-[#1f2937]">Doctor &amp; schedule</h3>
                <p>{viewItem.doctorName}</p>
                <p className="text-[#626a73]">
                  {formatWhen(viewItem.startsAt)} – {formatWhen(viewItem.endsAt)}
                </p>
                {viewItem.reason ? (
                  <p className="text-[#626a73]">Reason: {viewItem.reason}</p>
                ) : null}
              </section>

              <section className="space-y-1">
                <h3 className="font-semibold text-[#1f2937]">Payment</h3>
                <p>Fee: {formatInr(viewItem.feeSnapshotPaise)}</p>
                <p>
                  Status:{" "}
                  <Badge
                    variant="outline"
                    className={statusBadgeClass(viewItem.paymentStatus)}
                  >
                    {viewItem.paymentStatus}
                  </Badge>
                </p>
                {viewItem.payment?.providerPaymentId ? (
                  <p className="text-xs text-[#626a73]">
                    Razorpay payment: {viewItem.payment.providerPaymentId}
                  </p>
                ) : null}
                {viewItem.payment?.paidAt ? (
                  <p className="text-xs text-[#626a73]">
                    Paid at: {formatWhen(viewItem.payment.paidAt)}
                  </p>
                ) : null}
              </section>

              <section className="space-y-3">
                <h3 className="font-semibold text-[#1f2937]">Action</h3>
                <div className="space-y-1.5">
                  <Label>Appointment status</Label>
                  <Select
                    value={actionStatus}
                    onValueChange={(value) =>
                      setActionStatus(value as BookingStatusUpdate)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="DECLINED">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {actionStatus === "DECLINED" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="decline-reason">Decline reason</Label>
                    <Textarea
                      id="decline-reason"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      rows={3}
                      placeholder="Optional note sent to the patient"
                    />
                  </div>
                ) : null}
              </section>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewItem(null)}
            >
              Close
            </Button>
            <Button
              type="button"
              disabled={saving || !viewItem}
              onClick={() => void saveStatus()}
            >
              {saving ? "Saving…" : "Save status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminAppShell>
  );
}
