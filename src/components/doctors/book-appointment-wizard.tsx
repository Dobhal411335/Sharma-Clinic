"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  ImagePlus,
  Loader2,
  Stethoscope,
  Trash2,
  Upload,
} from "lucide-react";

import { AppointmentDateTimePicker } from "@/components/doctors/appointment-datetime-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAppointmentPaymentOrder,
  createDoctorAppointment,
  fetchDoctorSlots,
  uploadDoctorMedicalHistoryImage,
  verifyAppointmentPayment,
} from "@/features/doctors/create-doctor-appointment";
import { toApiError } from "@/lib/api/client";
import { showError } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  doctorProfileSlug,
  formatDoctorDisplayName,
  type DoctorProfile,
} from "@/types/doctors";
import Image from "next/image";

type BookAppointmentWizardProps = {
  doctor: DoctorProfile;
  /** Prefill from doctor schedule deep-link (`?date=&start=`). */
  initialDate?: string;
  initialStart?: string;
};

type FormErrors = Partial<
  Record<
    "patientName" | "email" | "phone" | "scheduledAt" | "medicalHistory",
    string
  >
>;

type Step = 1 | 2 | 3;

type BookingResult = {
  appointmentId: string;
  bookingReference: string;
  accessToken: string;
  feeSnapshotPaise: number;
  requiresPayment: boolean;
  doctorName: string;
  startsAt: string;
  endsAt: string;
};

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const PHONE_COUNTRY_CODE = "+91";

const STEPS = [
  { id: 1 as const, label: <p className="text-sm font-medium text-[#168b91]">Patient details</p> as React.ReactNode },
  { id: 2 as const, label: <p className="text-sm font-medium text-[#168b91]">Payment</p> as React.ReactNode },
  { id: 3 as const, label: <p className="text-sm font-medium text-[#168b91]">Confirmed</p> as React.ReactNode },
];

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

function formatInr(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

function formatWhen(startsAt: string, endsAt?: string): string {
  try {
    const start = new Date(startsAt);
    const dateLabel = new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(start);
    const timeFmt = new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
    const startLabel = timeFmt.format(start);
    if (!endsAt) return `${dateLabel} · ${startLabel}`;
    const endLabel = timeFmt.format(new Date(endsAt));
    return `${dateLabel} · ${startLabel} – ${endLabel}`;
  } catch {
    return startsAt;
  }
}

function phoneDigitsOnly(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

function phoneWithCountryCode(value: string): string {
  return `${PHONE_COUNTRY_CODE}${phoneDigitsOnly(value)}`;
}

async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function BookingTimeline({ current }: { current: Step }) {
  const progressPercent = current <= 1 ? 0 : current === 2 ? 50 : 100;

  return (
    <ol
      className="relative flex w-full items-start justify-between px-4 sm:px-8"
      aria-label="Booking steps"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-5 right-14 left-14 z-0 h-[3px] -translate-y-1/2 rounded-full sm:right-16 sm:left-16"
        style={{ backgroundColor: "#d8d0c2" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-5 left-14 z-0 h-[5px] -translate-y-1/2 rounded-full transition-all duration-300 sm:left-16"
        style={{
          backgroundColor: "#16a34a",
          width: `calc((100% - 7rem) * ${progressPercent / 100})`,
        }}
      />
      {STEPS.map((step) => {
        const done = current > step.id;
        const active = current === step.id;
        const filled = active || done;
        return (
          <li
            key={step.id}
            className="relative z-10 flex w-20 flex-col items-center gap-1.5 sm:w-24"
          >
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold",
                filled ? "text-black" : "border-[#cfc7b8] bg-white text-black",
              )}
              style={
                filled
                  ? { backgroundColor: "#16a34a", borderColor: "#16a34a" }
                  : undefined
              }
              aria-current={active ? "step" : undefined}
            >
              {done && !active ? (
                <Check className="size-4 stroke-[3] text-white" aria-hidden />
              ) : (
                step.id
              )}
            </span>
            <span
              className={cn(
                "text-center text-[11px] font-semibold sm:text-xs",
                filled ? "text-black" : "text-[#6b7280]",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function DoctorPanel({
  doctor,
  displayName,
  feePaise,
}: {
  doctor: DoctorProfile;
  displayName: string;
  feePaise: number;
}) {
  return (
    <aside className="relative hidden w-[42%] shrink-0 self-start overflow-hidden rounded-l-md md:sticky md:top-6 md:block md:h-[calc(100vh-7.5rem)] md:min-h-[28rem]">
      {doctor.photoUrl ? (
        <Image
          width={100}
          height={100}
          src={doctor.photoUrl}
          alt={displayName}
          className="absolute inset-0 h-full w-full object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#168b91]/15 via-[#d9ecee] to-[#f8f5ee]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 space-y-1 p-6 text-white">
        <p className="text-lg font-semibold">{displayName}</p>
        <p className="text-sm text-white/85">
          {doctor.specializations.join(", ")}
        </p>
        <p className="pt-1 text-sm font-semibold">Fee: {formatInr(feePaise)}</p>
      </div>
    </aside>
  );
}

function clinicLocalStartHmm(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).formatToParts(new Date(iso));
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

function normalizeHmm(value: string): string {
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(value.trim());
  if (!match) return value.trim().slice(0, 5);
  return `${match[1]!.padStart(2, "0")}:${match[2]}`;
}

function BookingSuccessPercent() {
  const [percent, setPercent] = useState(0);
  const [done, setDone] = useState(false);

  const finish = useEffectEvent(() => {
    setDone(true);
  });

  useEffect(() => {
    const durationMs = 1050;
    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / durationMs);
      setPercent(Math.round(progress * 100));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [finish]);

  if (done) return null;

  return (
    <span className="booking-success-percent absolute z-[5] text-sm font-bold tabular-nums text-[#15803d]">
      {percent}%
    </span>
  );
}

export function BookAppointmentWizard({
  doctor,
  initialDate,
  initialStart,
}: BookAppointmentWizardProps) {
  const searchParams = useSearchParams();
  const staffDoctorId = doctor.staffDoctorId?.trim() || "";
  const feePaise = doctor.consultationFeePaise ?? 0;
  const displayName = useMemo(
    () => formatDoctorDisplayName(doctor.name),
    [doctor.name],
  );
  const doctorHref = `/doctors/${doctorProfileSlug(doctor.name)}`;

  const queryDate = searchParams.get("date")?.trim() || "";
  const queryStart = searchParams.get("start")?.trim() || "";
  const prefillDate =
    initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)
      ? initialDate
      : /^\d{4}-\d{2}-\d{2}$/.test(queryDate)
        ? queryDate
        : "";
  const prefillStart =
    initialStart && /^([01]\d|2[0-3]):([0-5]\d)$/.test(normalizeHmm(initialStart))
      ? normalizeHmm(initialStart)
      : /^([01]\d|2[0-3]):([0-5]\d)$/.test(normalizeHmm(queryStart))
        ? normalizeHmm(queryStart)
        : "";

  const [step, setStep] = useState<Step>(1);
  const [patientName, setPatientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [slot, setSlot] = useState<{ startsAt: string; endsAt: string } | null>(
    null,
  );
  const [slotPrefillLoading, setSlotPrefillLoading] = useState(
    Boolean(prefillDate && prefillStart && staffDoctorId),
  );
  const [problem, setProblem] = useState("");
  const [medicalHistoryPreview, setMedicalHistoryPreview] = useState<
    string | null
  >(null);
  const [medicalHistoryUrl, setMedicalHistoryUrl] = useState("");
  const [medicalHistoryPublicId, setMedicalHistoryPublicId] = useState("");
  const [medicalHistoryFileName, setMedicalHistoryFileName] = useState<
    string | null
  >(null);
  const [medicalHistoryUploading, setMedicalHistoryUploading] = useState(false);
  const medicalHistoryInputRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState<BookingResult | null>(null);

  useEffect(() => {
    if (!staffDoctorId || !prefillDate || !prefillStart) {
      setSlotPrefillLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setSlotPrefillLoading(true);
      try {
        const slots = await fetchDoctorSlots(staffDoctorId, prefillDate);
        if (cancelled) return;
        if (slots.length === 0) {
          setSlot(null);
          showError(
            "That schedule slot is no longer available. Please choose another date and time.",
          );
          return;
        }
        const exact = slots.find(
          (item) => clinicLocalStartHmm(item.startsAt) === prefillStart,
        );
        const inWindow =
          exact ??
          slots.find((item) => clinicLocalStartHmm(item.startsAt) >= prefillStart);
        setSlot(inWindow ?? slots[0] ?? null);
      } catch {
        if (!cancelled) {
          setSlot(null);
          showError("Could not load the selected schedule time.");
        }
      } finally {
        if (!cancelled) setSlotPrefillLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [staffDoctorId, prefillDate, prefillStart]);

  const clearMedicalHistory = () => {
    setMedicalHistoryPreview(null);
    setMedicalHistoryUrl("");
    setMedicalHistoryPublicId("");
    setMedicalHistoryFileName(null);
    if (medicalHistoryInputRef.current) {
      medicalHistoryInputRef.current.value = "";
    }
  };

  const handleMedicalHistoryChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      setErrors((current) => ({
        ...current,
        medicalHistory: "Upload a JPG, PNG, or WebP image",
      }));
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((current) => ({
        ...current,
        medicalHistory: "Image must be 10MB or smaller",
      }));
      event.target.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setMedicalHistoryPreview(localPreview);
    setMedicalHistoryFileName(file.name);
    setMedicalHistoryUploading(true);

    try {
      const uploaded = await uploadDoctorMedicalHistoryImage(file);
      setMedicalHistoryUrl(uploaded.url);
      setMedicalHistoryPublicId(uploaded.publicId);
      setMedicalHistoryPreview(uploaded.url);
      URL.revokeObjectURL(localPreview);
    } catch (error) {
      URL.revokeObjectURL(localPreview);
      clearMedicalHistory();
      showError(toApiError(error).message || "Failed to upload image");
    } finally {
      setMedicalHistoryUploading(false);
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!patientName.trim()) next.patientName = "Name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email";
    }
    const digits = phoneDigitsOnly(phone);
    if (!digits) next.phone = "Phone number is required";
    else if (digits.length !== 10) {
      next.phone = "Enter a 10-digit mobile number";
    } else if (!/^[6-9]\d{9}$/.test(digits)) {
      next.phone = "Enter a valid Indian mobile number";
    }
    if (!slot) next.scheduledAt = "Choose an available date and time";
    if (medicalHistoryUploading) {
      next.medicalHistory = "Wait for the image upload to finish";
    }
    if (!staffDoctorId) {
      next.scheduledAt = "This doctor is not available for online booking yet.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const openCheckout = async (created: BookingResult) => {
    const ready = await loadRazorpayScript();
    if (!ready || !window.Razorpay) {
      throw new Error("Could not load Razorpay Checkout.");
    }
    const order = await createAppointmentPaymentOrder(created.appointmentId);
    const digits = phoneDigitsOnly(phone);

    await new Promise<void>((resolve, reject) => {
      const rzp = new window.Razorpay!({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Sharma Clinic",
        description: `Consultation with ${created.doctorName}`,
        order_id: order.orderId,
        prefill: {
          name: patientName.trim(),
          email: email.trim(),
          contact: phoneWithCountryCode(digits),
        },
        handler: async (response: unknown) => {
          try {
            const payload = response as {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            };
            await verifyAppointmentPayment(payload);
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () =>
            reject(new Error("Payment was cancelled. You can try again.")),
        },
      });
      rzp.open();
    });
  };

  const goToReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate() || !slot || !staffDoctorId) return;
    setStep(2);
  };

  const confirmAndPay = async () => {
    if (!validate() || !slot || !staffDoctorId) {
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      let created = booking;
      if (!created) {
        created = await createDoctorAppointment({
          doctorId: staffDoctorId,
          patientName: patientName.trim(),
          email: email.trim(),
          phone: phoneWithCountryCode(phone),
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          problem: problem.trim() || undefined,
          ...(medicalHistoryUrl && medicalHistoryPublicId
            ? {
                medicalHistoryImageUrl: medicalHistoryUrl,
                medicalHistoryImagePublicId: medicalHistoryPublicId,
              }
            : {}),
        });
        setBooking(created);
      }

      if (created.requiresPayment) {
        await openCheckout(created);
      }

      setStep(3);
    } catch (error) {
      showError(toApiError(error).message || "Could not complete booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (!staffDoctorId) {
    return (
      <div className="rounded-2xl border border-[#e8e1d4] bg-white/80 p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-[#1a2330]">
          Online booking unavailable
        </h2>
        <p className="mt-2 text-sm text-[#6b7280]">
          This doctor is not linked for online appointments yet.
        </p>
        <Button asChild className="mt-6">
          <Link href={doctorHref}>Back to doctor profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-5 sm:px-6">
        <BookingTimeline current={step} />
      </div>

      <div className="rounded-md border border-[#e8e1d4] shadow-sm">
        {step === 1 ? (
          <div className="flex items-start">
            <DoctorPanel
              doctor={doctor}
              displayName={displayName}
              feePaise={feePaise}
            />
            <div className="min-w-0 flex-1 rounded-md bg-[#fbf8f2] md:rounded-l-none md:rounded-r-md">
              <div className="p-4 sm:p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="mb-4">
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-[#1a2330] sm:text-2xl">
                    Book with {displayName}
                  </h2>
                </div>

                <form onSubmit={goToReview} className="space-y-3 pb-2">
                  <div className="space-y-2">
                    <Label htmlFor="book-name">
                      Full name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="book-name"
                      value={patientName}
                      onChange={(event) => setPatientName(event.target.value)}
                      className="border-[#e4ddd0] bg-white"
                      required
                    />
                    {errors.patientName ? (
                      <p className="text-sm text-destructive">
                        {errors.patientName}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="book-email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="book-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="border-[#e4ddd0] bg-white"
                        required
                      />
                      {errors.email ? (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="book-phone">
                        Phone <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex overflow-hidden rounded-md border border-[#e4ddd0] bg-[#fbf8f2] focus-within:ring-2 focus-within:ring-ring">
                        <span className="flex select-none items-center border-r border-[#e4ddd0] bg-[#f3efe6] px-3 text-sm font-semibold text-[#1a2330]">
                          {PHONE_COUNTRY_CODE}
                        </span>
                        <Input
                          id="book-phone"
                          type="tel"
                          inputMode="numeric"
                          value={phone}
                          onChange={(event) =>
                            setPhone(phoneDigitsOnly(event.target.value))
                          }
                          placeholder="9876543210"
                          maxLength={10}
                          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                          required
                        />
                      </div>
                      {errors.phone ? (
                        <p className="text-sm text-destructive">{errors.phone}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Date &amp; time <span className="text-destructive">*</span>
                    </Label>
                    {slotPrefillLoading ? (
                      <div className="flex h-10 items-center gap-2 rounded-md border border-[#e4ddd0] bg-[#fbf8f2] px-3 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        Loading selected schedule…
                      </div>
                    ) : (
                      <AppointmentDateTimePicker
                        doctorId={staffDoctorId}
                        value={slot}
                        onChange={setSlot}
                      />
                    )}
                    {slot && prefillDate && prefillStart ? (
                      <p className="text-xs text-muted-foreground">
                        Prefill from doctor schedule. You can change it if needed.
                      </p>
                    ) : null}
                    {errors.scheduledAt ? (
                      <p className="text-sm text-destructive">
                        {errors.scheduledAt}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="book-problem">
                      Problem / reason{" "}
                      <span className="font-normal text-[#8a8376]">
                        (optional)
                      </span>
                    </Label>
                    <Textarea
                      id="book-problem"
                      rows={3}
                      value={problem}
                      onChange={(event) => setProblem(event.target.value)}
                      className="border-[#e4ddd0] bg-white"
                      placeholder="Briefly describe your concern"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Medical history image (optional)</Label>
                    <input
                      ref={medicalHistoryInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) =>
                        void handleMedicalHistoryChange(event)
                      }
                    />
                    {medicalHistoryPreview ? (
                      <div className="flex items-center gap-3 rounded-xl border border-[#e4ddd0] bg-white p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={medicalHistoryPreview}
                          alt=""
                          className="size-14 rounded-md object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">
                            {medicalHistoryFileName}
                          </p>
                          {medicalHistoryUploading ? (
                            <p className="text-xs text-muted-foreground">
                              Uploading…
                            </p>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={clearMedicalHistory}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start gap-2 border-[#e4ddd0] bg-white"
                        onClick={() => medicalHistoryInputRef.current?.click()}
                      >
                        <Upload className="size-4" />
                        <ImagePlus className="size-4" />
                        Upload image
                      </Button>
                    )}
                    {errors.medicalHistory ? (
                      <p className="text-sm text-destructive">
                        {errors.medicalHistory}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 w-full bg-[#168b91] text-base hover:bg-[#12757a]"
                    disabled={medicalHistoryUploading}
                  >
                    Continue to Review
                  </Button>
                </form>
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex items-start">
            <DoctorPanel
              doctor={doctor}
              displayName={displayName}
              feePaise={feePaise}
            />
            <div className="min-w-0 flex-1 rounded-md bg-[#fbf8f2] p-5 sm:p-8 md:rounded-l-none md:rounded-r-md [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="mb-6">
                <p className="text-sm font-medium text-[#168b91]">
                  Step 2 · Review &amp; pay
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#1a2330]">
                  Confirm your booking
                </h2>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Check the details below
                  {feePaise > 0
                    ? ", then pay securely with Razorpay."
                    : ", then confirm your appointment."}
                </p>
              </div>

              <dl className="space-y-3 rounded-xl border border-[#e4ddd0] bg-white px-4 py-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#6b7280]">Doctor</dt>
                  <dd className="text-right font-medium text-[#1a2330]">
                    {displayName}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#6b7280]">Patient</dt>
                  <dd className="text-right font-medium text-[#1a2330]">
                    {patientName.trim()}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#6b7280]">Email</dt>
                  <dd className="text-right font-medium text-[#1a2330]">
                    {email.trim()}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#6b7280]">Phone</dt>
                  <dd className="text-right font-medium text-[#1a2330]">
                    {PHONE_COUNTRY_CODE} {phoneDigitsOnly(phone)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#6b7280]">When</dt>
                  <dd className="text-right font-medium text-[#1a2330]">
                    {slot ? formatWhen(slot.startsAt, slot.endsAt) : "—"}
                  </dd>
                </div>
                {problem.trim() ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#6b7280]">Reason</dt>
                    <dd className="max-w-[60%] text-right font-medium text-[#1a2330]">
                      {problem.trim()}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4 border-t border-[#efe9dd] pt-3">
                  <dt className="text-[#6b7280]">Fee</dt>
                  <dd className="text-right text-base font-semibold text-[#1a2330]">
                    {formatInr(booking?.feeSnapshotPaise ?? feePaise)}
                  </dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-14 flex-1 border-[#e4ddd0] bg-white text-base font-semibold"
                  disabled={submitting}
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="size-5" />
                  Edit details
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="h-14 flex-[1.4] bg-[#168b91] text-base font-semibold hover:bg-[#12757a]"
                  disabled={submitting}
                  onClick={() => void confirmAndPay()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      {feePaise > 0 ? "Opening Razorpay…" : "Confirming…"}
                    </>
                  ) : feePaise > 0 ? (
                    <>
                      <CreditCard className="size-5" />
                      Pay with Razorpay ({formatInr(feePaise)})
                    </>
                  ) : (
                    "Confirm booking"
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 && booking ? (
          <div className="bg-[#fbf8f2] px-5 py-10 sm:px-10 sm:py-14">
            <div className="mx-auto max-w-xl text-center">
              <div
                className="relative mx-auto mb-6 flex size-28 items-center justify-center"
                aria-hidden
              >
                <svg
                  className="absolute inset-0 size-full -rotate-90"
                  viewBox="0 0 100 100"
                  role="presentation"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(22, 163, 74, 0.15)"
                    strokeWidth="8"
                  />
                  <circle
                    className="booking-success-progress-ring"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>

                <BookingSuccessPercent />

                <span
                  className="booking-success-check absolute z-10 flex size-16 items-center justify-center rounded-full text-white"
                  style={{
                    backgroundColor: "#16a34a",
                    boxShadow: "0 10px 24px rgba(22, 163, 74, 0.35)",
                  }}
                >
                  <CheckCircle2 className="size-9 text-white" aria-hidden />
                </span>
              </div>

              <p className="text-sm font-medium" style={{ color: "#15803d" }}>
                Step 3 · Confirmed
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1a2330]">
                Thank you for booking
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#6b7280]">
                Your appointment request is received
                {booking.requiresPayment ? " and payment is confirmed" : ""}.
                The clinic will review and accept it shortly. A confirmation
                email will follow once accepted.
              </p>

              <div className="mt-8 overflow-hidden rounded-2xl border border-[#e4ddd0] bg-white text-left shadow-sm">
                <div className="border-b border-[#efe9dd] bg-[#f8f5ee] px-5 py-3">
                  <p className="text-xs font-semibold tracking-wide text-[#6b7280] uppercase">
                    Booking summary
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-[#1a2330]">
                    {booking.bookingReference}
                  </p>
                </div>
                <ul className="divide-y divide-[#efe9dd]">
                  <li className="flex items-start gap-3 px-5 py-4">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#d9ecee] text-[#168b91]">
                      <Stethoscope className="size-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-xs text-[#6b7280]">Doctor</p>
                      <p className="font-semibold text-[#1a2330]">
                        {booking.doctorName}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 px-5 py-4">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#d9ecee] text-[#168b91]">
                      <CalendarDays className="size-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-xs text-[#6b7280]">When</p>
                      <p className="font-semibold text-[#1a2330]">
                        {formatWhen(
                          slot?.startsAt ?? booking.startsAt,
                          slot?.endsAt ?? booking.endsAt,
                        )}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 px-5 py-4">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#d9ecee] text-[#168b91]">
                      <CreditCard className="size-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-xs text-[#6b7280]">Fee</p>
                      <p className="text-lg font-bold text-[#1a2330]">
                        {formatInr(booking.feeSnapshotPaise)}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <Button
                asChild
                size="lg"
                className="mt-8 h-12 w-full bg-[#168b91] text-base hover:bg-[#12757a] sm:w-auto sm:min-w-56"
              >
                <Link href="/">Go to home page</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
