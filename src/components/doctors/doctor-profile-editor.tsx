"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Eye,
  EyeOff,
  IdCard,
  KeyRound,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { DoctorProfileForm } from "@/components/admin/cms/doctors/doctor-profile-form";
import { DoctorScheduleForm } from "@/components/doctors/doctor-schedule-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { generateStrongPassword } from "@/lib/auth/password-client";
import { showError, showSuccess } from "@/lib/toast";
import {
  extractDoctorPrefixAndName,
  toDoctorProfilePayload,
  validateDoctorProfileForm,
  type DoctorProfileFormErrors,
} from "@/schemas/doctor-profile-schema";
import { ApiError } from "@/services/api/errors";
import type { DoctorAccountDetail } from "@/types/admin/doctor-account";
import type { DoctorProfileFormValues } from "@/types/admin/doctor-profile";
import type {
  DoctorAvailabilityDto,
  DoctorAvailabilityPayload,
} from "@/types/doctors-availability";

type EditorSection = "login" | "basic" | "schedule";

type DoctorProfileEditorProps = {
  mode: "admin" | "doctor";
  backHref?: string;
  loadAccount: () => Promise<DoctorAccountDetail>;
  saveAccount: (input: {
    name?: string;
    phone?: string;
    password?: string;
    passcode?: string;
    profile?: DoctorAccountDetail["profile"];
  }) => Promise<void>;
  loadAvailability: () => Promise<DoctorAvailabilityDto>;
  saveAvailability: (payload: DoctorAvailabilityPayload) => Promise<void>;
};

function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(2, 12);
  }
  return digits.slice(0, 10);
}

const SECTIONS: Array<{
  id: EditorSection;
  label: string;
  description: string;
  icon: typeof KeyRound;
}> = [
  {
    id: "login",
    label: "Login details",
    description: "Email, password, and passcode",
    icon: KeyRound,
  },
  {
    id: "basic",
    label: "Basic doctor details",
    description: "Profile, photo, and contact",
    icon: IdCard,
  },
  {
    id: "schedule",
    label: "Doctor schedule",
    description: "Day windows and appointment length",
    icon: CalendarClock,
  },
];

export function DoctorProfileEditor({
  mode,
  backHref,
  loadAccount,
  saveAccount,
  loadAvailability,
  saveAvailability,
}: DoctorProfileEditorProps) {
  const credentialsEditable = mode === "admin";
  const [section, setSection] = useState<EditorSection>("login");
  const [values, setValues] = useState<DoctorProfileFormValues | null>(null);
  const [errors, setErrors] = useState<DoctorProfileFormErrors>({});
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [canShowPendingPassword, setCanShowPendingPassword] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [availability, setAvailability] = useState<DoctorAvailabilityDto | null>(
    null,
  );
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const hydrateAccount = useCallback(async () => {
    const account = await loadAccount();
    const { prefix, name } = extractDoctorPrefixAndName(account.profile.name);
    setValues({
      prefix,
      name,
      specializations: account.profile.specializations,
      about: account.profile.about,
      experienceYears: String(account.profile.experienceYears ?? ""),
      state: account.profile.state,
      city: account.profile.city,
      phone: phoneDigits(account.profile.phone || account.phone),
      email: account.email,
      location: account.profile.location,
      qualificationTitle: account.profile.qualificationTitle || "Qualification",
      qualificationCards: Array.isArray(account.profile.qualificationCards)
        ? account.profile.qualificationCards
        : [],
      photoUrl: account.profile.photoUrl,
      photoPublicId: account.profile.photoPublicId,
      active: account.profile.active,
      order: String(account.profile.order ?? ""),
      consultationFeeInr: String(
        Math.floor((account.profile.consultationFeePaise ?? 0) / 100),
      ),
    });
    setPassword(account.passwordPrefill ?? "");
    setPasscode(account.passcode);
    setCanShowPendingPassword(account.canShowPendingPassword);
    setApprovalStatus(account.approvalStatus);
    setFormKey((key) => key + 1);
  }, [loadAccount]);

  const hydrateAvailability = useCallback(async () => {
    setAvailabilityLoading(true);
    try {
      const data = await loadAvailability();
      setAvailability(data);
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Could not load schedule.",
      );
    } finally {
      setAvailabilityLoading(false);
    }
  }, [loadAvailability]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        await hydrateAccount();
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof ApiError ? error.message : "Could not load doctor.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateAccount]);

  useEffect(() => {
    if (section === "schedule") {
      void hydrateAvailability();
    }
  }, [section, hydrateAvailability]);

  const onSubmitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values) return;

    const validated = validateDoctorProfileForm(values);
    if (!validated.success) {
      setErrors(validated.errors);
      setSection("basic");
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const payload = toDoctorProfilePayload(
        validated.data,
        Number(validated.data.order) || 0,
      );
      await saveAccount({
        name: `${validated.data.prefix || "Dr."} ${validated.data.name}`.trim(),
        phone: validated.data.phone,
        ...(credentialsEditable
          ? {
              password: password.trim() || undefined,
              passcode: passcode.trim() || undefined,
            }
          : {}),
        profile: {
          ...payload,
          prefix: validated.data.prefix || "Dr.",
          order: payload.order ?? 0,
          consultationFeePaise: payload.consultationFeePaise ?? 0,
        },
      });
      showSuccess("Doctor details saved.");
      await hydrateAccount();
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Could not save doctor details.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSaveCredentials = async () => {
    if (!credentialsEditable || !values) return;
    setIsSubmitting(true);
    try {
      await saveAccount({
        password: password.trim() || undefined,
        passcode: passcode.trim() || undefined,
        phone: values.phone,
      });
      showSuccess("Login details saved.");
      await hydrateAccount();
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Could not save login details.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {backHref ? (
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={backHref}>
              <ArrowLeft className="size-4" aria-hidden />
              Back
            </Link>
          </Button>
        </div>
      ) : null}

      {loadError ? (
        <Alert variant="destructive">
          <AlertTitle>Doctor not found</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading || !values ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading doctor details…
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-border bg-white p-3 lg:sticky lg:top-24">
            <nav className="space-y-1" aria-label="Doctor edit sections">
              {SECTIONS.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted/60",
                    )}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0">
            {section === "login" ? (
              <Card className="border-border shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">Login details</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Status: {approvalStatus.replaceAll("_", " ")}.
                    {credentialsEditable
                      ? canShowPendingPassword
                        ? " Password is shown while pending or until credentials are emailed."
                        : " Password is hashed — leave blank to keep the current password."
                      : " Login credentials are managed by admin."}
                  </p>
                </CardHeader>
                <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Login email</Label>
                    <Input value={values.email} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-doctor-password">Password</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="edit-doctor-password"
                          type={showPassword ? "text" : "password"}
                          value={
                            credentialsEditable
                              ? password
                              : "********"
                          }
                          readOnly={!credentialsEditable}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder={
                            canShowPendingPassword
                              ? "Pending password"
                              : "Leave blank to keep current"
                          }
                          className="pr-11"
                        />
                        {credentialsEditable ? (
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        ) : null}
                      </div>
                      {credentialsEditable ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPassword(generateStrongPassword())}
                        >
                          <RefreshCw className="size-4" aria-hidden />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-doctor-passcode">Passcode</Label>
                    <Input
                      id="edit-doctor-passcode"
                      value={passcode}
                      readOnly={!credentialsEditable}
                      onChange={(event) => setPasscode(event.target.value)}
                    />
                  </div>
                  {credentialsEditable ? (
                    <div className="sm:col-span-2">
                      <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => void onSaveCredentials()}
                      >
                        {isSubmitting ? "Saving…" : "Save login details"}
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {section === "basic" ? (
              <DoctorProfileForm
                key={formKey}
                values={values}
                errors={errors}
                isSubmitting={isSubmitting}
                isEditing
                editingId={mode === "admin" ? "admin-edit" : "doctor-self"}
                feeEditable={mode === "admin"}
                onChange={setValues}
                onSubmit={onSubmitProfile}
                onReset={() => void hydrateAccount()}
              />
            ) : null}

            {section === "schedule" ? (
              <DoctorScheduleForm
                initial={availability}
                isLoading={availabilityLoading}
                onSave={async (payload) => {
                  await saveAvailability(payload);
                  await hydrateAvailability();
                }}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
