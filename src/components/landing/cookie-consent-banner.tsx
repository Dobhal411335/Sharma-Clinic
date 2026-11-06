"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const COOKIE_CONSENT_KEY = "clinic_cookie_consent";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      // In case localStorage is blocked by browser security/privacy settings
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    } catch {
      // Ignore localStorage errors
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-lg"
    >
      <div className="rounded-[10px] border border-white/10 bg-[#17191C] p-6 text-white shadow-2xl ring-1 ring-black/40 sm:p-7">
        <p className="font-sans text-sm leading-relaxed text-zinc-200 sm:text-[14.5px]">
          The cookie settings on this website are set to &apos;allow all
          cookies&apos; to give you the very best experience. Please click Accept
          Cookies to continue to use the site.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-5 font-sans text-xs font-semibold tracking-wider uppercase sm:text-sm">
          <Link
            href="/policies/privacy"
            className="text-zinc-300 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#287F79]"
          >
            PRIVACY POLICY
          </Link>
          <button
            type="button"
            onClick={handleAccept}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] bg-[#287F79] px-4 py-2 font-bold text-white shadow-sm transition-all hover:bg-[#206A65] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#287F79] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17191C]"
          >
            <span>ACCEPT</span>
            <Check className="size-4 stroke-[3]" aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  );
}
