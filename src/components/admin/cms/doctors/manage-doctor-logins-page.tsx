"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleCheck,
  Mail,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showError, showSuccess } from "@/lib/toast";
import { storefrontBaseUrl } from "@/lib/storefront-url";
import {
  approveDoctorAccount,
  disableDoctorAccount,
  fetchDoctorAccounts,
  sendDoctorCredentials,
} from "@/services/api/doctor-accounts";
import { ApiError } from "@/services/api/errors";
import type { DoctorAccountListItem } from "@/types/admin/doctor-account";
import { formatDoctorDisplayName } from "@/types/doctors";

type StatusFilter = "ALL" | "PENDING_APPROVAL" | "APPROVED" | "DISABLED";

function statusLabel(status: DoctorAccountListItem["approvalStatus"]): string {
  if (status === "PENDING_APPROVAL") return "Pending Approval";
  if (status === "DISABLED") return "Disabled";
  return "Approved";
}

function statusBadgeClass(status: DoctorAccountListItem["approvalStatus"]): string {
  if (status === "PENDING_APPROVAL") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  if (status === "DISABLED") {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }
  return "border-sky-200 bg-sky-50 text-sky-800";
}

export function ManageDoctorLoginsPage() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [doctors, setDoctors] = useState<DoctorAccountListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [approveTarget, setApproveTarget] = useState<DoctorAccountListItem | null>(null);
  const [approvePassword, setApprovePassword] = useState("");
  const [approvePasscode, setApprovePasscode] = useState("");
  const [approving, setApproving] = useState(false);

  const [sendTarget, setSendTarget] = useState<DoctorAccountListItem | null>(null);
  const [sendPasswordPreview, setSendPasswordPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const rows = await fetchDoctorAccounts(status);
      setDoctors(rows);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Failed to load doctors.");
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const openApprove = (doctor: DoctorAccountListItem) => {
    setApproveTarget(doctor);
    setApprovePassword(doctor.pendingPassword ?? "");
    setApprovePasscode(doctor.passcode);
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    setApproving(true);
    try {
      const result = await approveDoctorAccount(approveTarget.id, {
        password: approvePassword,
        passcode: approvePasscode,
      });
      showSuccess("Doctor approved.");
      setApproveTarget(null);
      setSendPasswordPreview(result.passwordForEmail);
      setSendTarget(result);
      await load();
    } catch (error) {
      showError(error instanceof ApiError ? error.message : "Could not approve doctor.");
    } finally {
      setApproving(false);
    }
  };

  const handleSend = async () => {
    if (!sendTarget) return;
    setSending(true);
    try {
      await sendDoctorCredentials(sendTarget.id);
      showSuccess("Credentials email sent.");
      setSendTarget(null);
      setSendPasswordPreview(null);
      await load();
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Could not send credentials email.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleDisable = async (doctor: DoctorAccountListItem) => {
    try {
      await disableDoctorAccount(doctor.id);
      showSuccess("Doctor disabled.");
      await load();
    } catch (error) {
      showError(error instanceof ApiError ? error.message : "Could not disable doctor.");
    }
  };

  const loginUrl = `${storefrontBaseUrl() || ""}/login`.replace(/([^:]\/)\/+/g, "$1");

  return (
    <AdminAppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as StatusFilter)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="DISABLED">Disabled</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/admin/doctors/create">Create doctor</Link>
          </Button>
        </div>

        {loadError ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load doctors</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-[#fafafa] text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">ID / Username</th>
                  <th className="px-4 py-3">Employee details</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Credentials</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      Loading doctors…
                    </td>
                  </tr>
                ) : doctors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      No doctors found for this filter.
                    </td>
                  </tr>
                ) : (
                  doctors.map((doctor) => (
                    <tr key={doctor.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-4 align-top">
                        <p className="font-semibold text-foreground">
                          {doctor.doctorId?.slice(0, 8) || doctor.id.slice(0, 8)}
                        </p>
                        <p className="text-muted-foreground">
                          @{doctor.email.split("@")[0]}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="font-semibold text-foreground">{doctor.name}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Mail className="size-3.5" aria-hidden />
                            {doctor.email}
                          </span>
                          {doctor.phone ? <span>{doctor.phone}</span> : null}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <Badge
                          variant="outline"
                          className={statusBadgeClass(doctor.approvalStatus)}
                        >
                          {statusLabel(doctor.approvalStatus)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 align-top">
                        {doctor.credentialsSent ? (
                          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                            <CheckCircle2 className="size-4" aria-hidden />
                            Sent
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not Generated</span>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/doctors/${doctor.id}/edit`}>
                              <Pencil className="size-4" aria-hidden />
                              Edit Doctor
                            </Link>
                          </Button>
                          {doctor.approvalStatus !== "DISABLED" ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  className="rounded-full"
                                  aria-label={`More actions for ${doctor.name}`}
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                {doctor.approvalStatus === "PENDING_APPROVAL" ? (
                                  <DropdownMenuItem
                                    onClick={() => openApprove(doctor)}
                                    className="text-sky-700 focus:text-sky-700"
                                  >
                                    <CircleCheck className="size-4" aria-hidden />
                                    Approve Doctor
                                  </DropdownMenuItem>
                                ) : null}
                                {doctor.approvalStatus === "APPROVED" ? (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSendPasswordPreview(doctor.pendingPassword);
                                      setSendTarget(doctor);
                                    }}
                                  >
                                    <Mail className="size-4" aria-hidden />
                                    Send Credentials
                                  </DropdownMenuItem>
                                ) : null}
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => void handleDisable(doctor)}
                                >
                                  <Trash2 className="size-4" aria-hidden />
                                  Disable Doctor
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog
        open={Boolean(approveTarget)}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Approve Doctor Account</DialogTitle>
            <DialogDescription>
              Confirm the login email, password, and passcode this doctor will use.
            </DialogDescription>
          </DialogHeader>
          {approveTarget ? (
            <div className="space-y-4">
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Name: </span>
                  <span className="font-semibold">{approveTarget.name}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Gmail: </span>
                  <span className="font-semibold">{approveTarget.email}</span>
                </p>
              </div>
              <div className="space-y-2">
                <Label>Login email</Label>
                <Input value={approveTarget.email} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approve-password">Password</Label>
                <Input
                  id="approve-password"
                  value={approvePassword}
                  onChange={(event) => setApprovePassword(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approve-passcode">Passcode</Label>
                <Input
                  id="approve-passcode"
                  value={approvePasscode}
                  onChange={(event) => setApprovePasscode(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Saved as plain text for passcode login.
                </p>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button type="button" disabled={approving} onClick={() => void handleApprove()}>
              Approve & Save Credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(sendTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setSendTarget(null);
            setSendPasswordPreview(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Login Credentials</DialogTitle>
            <DialogDescription>
              This will dispatch an automated email containing the login credentials.
            </DialogDescription>
          </DialogHeader>
          {sendTarget ? (
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p>
                <span className="text-muted-foreground">To: </span>
                {sendTarget.email}
              </p>
              <p className="mt-1">
                <span className="text-muted-foreground">Subject: </span>
                Your Sharma Clinic doctor login credentials
              </p>
              <div className="mt-4 border-t border-border pt-4">
                <p>Hello {formatDoctorDisplayName(sendTarget.name)},</p>
                <p className="mt-2">Your doctor account has been approved.</p>
                <div className="mt-3 rounded-lg border border-border bg-white p-3">
                  <p>
                    <strong>Login email:</strong> {sendTarget.email}
                  </p>
                  <p>
                    <strong>Password:</strong>{" "}
                    {sendPasswordPreview || sendTarget.pendingPassword || "********"}
                  </p>
                  <p>
                    <strong>Passcode:</strong> {sendTarget.passcode || "—"}
                  </p>
                </div>
                <p className="mt-3 text-muted-foreground">
                  Login link: {loginUrl}
                </p>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSendTarget(null);
                setSendPasswordPreview(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={
                sending || (!sendTarget?.pendingPassword && !sendPasswordPreview)
              }
              onClick={() => void handleSend()}
            >
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminAppShell>
  );
}
