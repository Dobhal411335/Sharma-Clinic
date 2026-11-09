"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, RefreshCw, ShieldCheck } from "lucide-react";

import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateStrongPassword } from "@/lib/auth/password-client";
import { showError, showSuccess } from "@/lib/toast";
import {
  DOCTOR_PREFIX_OPTIONS,
  type DoctorPrefix,
} from "@/schemas/doctor-profile-schema";
import {
  confirmDoctorEmailVerification,
  createDoctorAccount,
  sendDoctorEmailVerification,
} from "@/services/api/doctor-accounts";
import { ApiError } from "@/services/api/errors";

export function CreateDoctorAccountPage() {
  const router = useRouter();
  const [prefix, setPrefix] = useState<DoctorPrefix>("Dr.");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSectionVisible, setOtpSectionVisible] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [confirmingOtp, setConfirmingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emailNormalized = useMemo(() => email.trim().toLowerCase(), [email]);
  const emailVerified =
    Boolean(verificationToken) && verifiedEmail === emailNormalized;

  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      await sendDoctorEmailVerification(emailNormalized);
      setVerificationToken(null);
      setVerifiedEmail(null);
      setOtp("");
      setOtpSectionVisible(true);
      showSuccess("Verification code sent to the doctor email.");
    } catch (error) {
      showError(error instanceof ApiError ? error.message : "Could not send code.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleConfirmOtp = async () => {
    setConfirmingOtp(true);
    try {
      const result = await confirmDoctorEmailVerification(emailNormalized, otp);
      setVerificationToken(result.verificationToken);
      setVerifiedEmail(emailNormalized);
      setOtpSectionVisible(false);
      showSuccess("Email verified.");
    } catch (error) {
      showError(error instanceof ApiError ? error.message : "Could not verify email.");
    } finally {
      setConfirmingOtp(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!emailVerified || !verificationToken) {
      showError("Verify the doctor email before submitting.");
      return;
    }

    const cleanName = name.trim();
    if (!cleanName) {
      showError("Doctor name is required.");
      return;
    }

    setSubmitting(true);
    try {
      await createDoctorAccount({
        name: `${prefix} ${cleanName}`.trim(),
        email: emailNormalized,
        phone: phone.trim(),
        password,
        passcode: passcode.trim(),
        emailVerificationToken: verificationToken,
      });
      showSuccess("Doctor created. Pending approval.");
      router.push("/admin/doctors/logins");
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Could not create doctor.",
      );
      setSubmitting(false);
    }
  };

  return (
    <AdminAppShell>
      <Card className="mx-auto max-w-2xl border-border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">Create Doctor Profile</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add login basics first. After create, approve the doctor from Manage Doctor
            Login, then complete the full profile.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="doctor-account-name">Doctor name</Label>
              <div className="flex gap-2">
                <div className="w-36 shrink-0">
                  <Select
                    value={prefix}
                    onValueChange={(value) => setPrefix(value as DoctorPrefix)}
                  >
                    <SelectTrigger
                      id="doctor-account-prefix"
                      aria-label="Doctor title prefix"
                      className="w-full py-5"
                    >
                      <SelectValue placeholder="Prefix" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCTOR_PREFIX_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  id="doctor-account-name"
                  value={name}
                  type="text"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Anita Sharma"
                  required
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Saved as{" "}
                <span className="font-medium text-foreground">
                  {prefix} {name.trim() || "…"}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor-account-email">Email</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="doctor-account-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setVerificationToken(null);
                    setVerifiedEmail(null);
                    setOtpSectionVisible(false);
                    setOtp("");
                  }}
                  placeholder="doctor@example.com"
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={sendingOtp || !emailNormalized.includes("@") || emailVerified}
                  onClick={() => void handleSendOtp()}
                >
                  {sendingOtp ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    "Verify email"
                  )}
                </Button>
              </div>
              {emailVerified ? (
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                  <ShieldCheck className="size-4" aria-hidden />
                  Email verified
                </p>
              ) : null}
            </div>

            {otpSectionVisible && !emailVerified ? (
              <div className="space-y-2 rounded-xl border border-dashed border-border bg-muted/20 p-4">
                <Label htmlFor="doctor-account-otp">Verification code</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="doctor-account-otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="6-digit code"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    disabled={confirmingOtp || otp.length !== 6}
                    onClick={() => void handleConfirmOtp()}
                  >
                    {confirmingOtp ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      "Confirm code"
                    )}
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="doctor-account-phone">Phone</Label>
              <Input
                id="doctor-account-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="9876543210"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor-account-password">Password</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="doctor-account-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Set a password"
                    required
                    minLength={8}
                    className="pr-11"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPassword(generateStrongPassword())}
                >
                  <RefreshCw className="size-4" aria-hidden />
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor-account-passcode">Passcode</Label>
              <Input
                id="doctor-account-passcode"
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                placeholder="e.g. 159753"
                required
                minLength={4}
              />
              <p className="text-xs text-muted-foreground">
                Doctors can sign in with this passcode alone. Stored as plain text.
              </p>
            </div>

            <Button type="submit" disabled={submitting || !emailVerified} className="w-full sm:w-auto">
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Creating…
                </>
              ) : (
                "Create doctor"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminAppShell>
  );
}
