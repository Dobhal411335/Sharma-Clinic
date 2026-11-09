"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import { resolvePostLoginPath } from "@/lib/auth/paths";
import { GENERIC_LOGIN_FAILURE, type StaffRole } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

const PORTALS: Array<{ role: StaffRole; label: string; hint: string }> = [
  {
    role: "ADMIN",
    label: "Admin",
    hint: "Sign in to the admin dashboard.",
  },
  {
    role: "DOCTOR",
    label: "Doctor",
    hint: "Sign in to the doctor dashboard.",
  },
];

type DoctorLoginMethod = "password" | "passcode";

export function LoginForm() {
  const searchParams = useSearchParams();
  const emailId = useId();
  const passwordId = useId();
  const passcodeId = useId();
  const errorId = useId();

  const [portal, setPortal] = useState<StaffRole>("ADMIN");
  const [doctorMethod, setDoctorMethod] = useState<DoctorLoginMethod>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const activePortal = PORTALS.find((item) => item.role === portal) ?? PORTALS[0];
  const usePasscode = portal === "DOCTOR" && doctorMethod === "passcode";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const result = await signIn("credentials", {
        ...(usePasscode
          ? {
              loginMethod: "passcode",
              passcode,
              email: "",
              password: "",
            }
          : {
              loginMethod: "password",
              email,
              password,
              passcode: "",
            }),
        role: portal,
        redirect: false,
      });

      if (!result || result.error) {
        setError(GENERIC_LOGIN_FAILURE);
        setPending(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = (await sessionRes.json()) as {
        user?: { role?: StaffRole };
      };
      const role = session.user?.role;
      if (role !== portal) {
        await signOut({ redirect: false });
        setError(GENERIC_LOGIN_FAILURE);
        setPending(false);
        return;
      }

      const destination = resolvePostLoginPath(
        role,
        searchParams.get("callbackUrl"),
        window.location.origin,
      );
      const url = new URL(destination, window.location.origin);
      url.searchParams.set("welcome", "1");
      window.location.assign(`${url.pathname}${url.search}`);
      return;
    } catch {
      setError(GENERIC_LOGIN_FAILURE);
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-5"
      noValidate
      aria-describedby={error ? errorId : undefined}
    >
      <div
        role="tablist"
        aria-label="Choose a staff sign-in"
        className="grid grid-cols-2 rounded-lg bg-[#e8f2f7] p-1"
      >
        {PORTALS.map((item) => {
          const selected = item.role === portal;
          return (
            <button
              key={item.role}
              type="button"
              role="tab"
              id={`login-tab-${item.role}`}
              aria-selected={selected}
              aria-controls="login-panel"
              disabled={pending}
              onClick={() => {
                setPortal(item.role);
                setError(null);
              }}
              className={cn(
                "h-10 rounded-md text-sm font-semibold transition",
                selected
                  ? "bg-white text-[#102a43] shadow-sm"
                  : "text-[#5b6b7c] hover:text-[#102a43]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c94]",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <p
        id="login-panel"
        role="tabpanel"
        aria-labelledby={`login-tab-${portal}`}
        className="text-sm text-[#5b6b7c]"
      >
        {activePortal.hint}
      </p>

      {portal === "DOCTOR" ? (
        <div
          role="tablist"
          aria-label="Doctor sign-in method"
          className="grid grid-cols-2 gap-2"
        >
          {(
            [
              { id: "password", label: "Email & password" },
              { id: "passcode", label: "Passcode" },
            ] as const
          ).map((item) => {
            const selected = doctorMethod === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                disabled={pending}
                onClick={() => {
                  setDoctorMethod(item.id);
                  setError(null);
                }}
                className={cn(
                  "h-9 rounded-md border px-3 text-xs font-semibold transition sm:text-sm",
                  selected
                    ? "border-[#146c94] bg-[#e8f2f7] text-[#102a43]"
                    : "border-[#d9e5ea] bg-white text-[#5b6b7c] hover:text-[#102a43]",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {usePasscode ? (
        <div className="flex flex-col gap-2">
          <label htmlFor={passcodeId} className="text-sm font-medium text-[#102a43]">
            Passcode
          </label>
          <input
            id={passcodeId}
            name="passcode"
            type="password"
            autoComplete="one-time-code"
            required
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            disabled={pending}
            className={cn(
              "h-11 rounded-md border border-[#d9e5ea] bg-white px-3 text-base text-[#102a43]",
              "outline-none transition focus-visible:border-[#146c94] focus-visible:ring-2 focus-visible:ring-[#146c94]/30",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <label htmlFor={emailId} className="text-sm font-medium text-[#102a43]">
              Email
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={pending}
              className={cn(
                "h-11 rounded-md border border-[#d9e5ea] bg-white px-3 text-base text-[#102a43]",
                "outline-none transition focus-visible:border-[#146c94] focus-visible:ring-2 focus-visible:ring-[#146c94]/30",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={passwordId} className="text-sm font-medium text-[#102a43]">
              Password
            </label>
            <div className="relative">
              <input
                id={passwordId}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={pending}
                className={cn(
                  "h-11 w-full rounded-md border border-[#d9e5ea] bg-white px-3 pr-11 text-base text-[#102a43]",
                  "outline-none transition focus-visible:border-[#146c94] focus-visible:ring-2 focus-visible:ring-[#146c94]/30",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#5b6b7c] hover:text-[#102a43] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#146c94]"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={pending}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#146c94] px-4 text-sm font-semibold text-white",
          "transition hover:bg-[#0f5675] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c94]",
          "disabled:cursor-not-allowed disabled:opacity-70",
        )}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Signing in…
          </>
        ) : (
          `Sign in as ${activePortal.label.toLowerCase()}`
        )}
      </button>
    </form>
  );
}
