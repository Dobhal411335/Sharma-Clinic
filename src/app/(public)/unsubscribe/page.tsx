"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Home, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { companyDisplayName } from "@/data/site";
import { unsubscribeNewsletter } from "@/features/newsletter/newsletter.service";
import { useCompanyBasicInfo } from "@/providers/company-basic-info-provider";

function UnsubscribeContent() {
  const company = useCompanyBasicInfo();
  const clinicName = companyDisplayName(company.companyName);
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";

  const [status, setStatus] = useState<"confirm" | "loading" | "success" | "error">(
    token ? "confirm" : "error",
  );
  const [email, setEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>(
    token
      ? ""
      : "No unsubscribe token was found in the link. Please open the link directly from your email.",
  );

  const handleUnsubscribe = async () => {
    if (!token) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await unsubscribeNewsletter(token);
      setEmail(res.data?.email || null);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      const rawMsg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "";

      if (rawMsg.toLowerCase().includes("network error")) {
        setErrorMessage(
          "Could not connect to the server. Please check your internet connection and try again.",
        );
      } else {
        setErrorMessage(rawMsg || "This unsubscribe link is invalid or has already been used.");
      }
    }
  };

  return (
    <div className="flex min-h-[65vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md text-center shadow-md border-border/80">
        {/* 1. Confirmation View */}
        {status === "confirm" && (
          <>
            <CardHeader className="pb-4 space-y-3">
              <div className="mx-auto flex size-16 items-center justify-center text-4xl select-none">
                🥺
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">
                Are you sure you want to unsubscribe?
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-muted-foreground px-2">
                We&apos;re sad to see you go! If you unsubscribe, you will no longer receive
                exclusive promotions, skincare tips, and product announcements from {clinicName}.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-2.5 pt-2">
              <Button
                type="button"
                onClick={handleUnsubscribe}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-5"
              >
                Yes, Unsubscribe
              </Button>
              <Button asChild variant="outline" className="w-full py-5 border border-black">
                <Link href="/">No, Keep Me Subscribed</Link>
              </Button>
            </CardFooter>
          </>
        )}

        {/* 2. Loading State */}
        {status === "loading" && (
          <CardHeader className="py-12 space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
              <Loader2 className="size-7 animate-spin text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">
              Updating your email preferences...
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Please wait a moment while we process your request.
            </CardDescription>
          </CardHeader>
        )}

        {/* 3. Success State */}
        {status === "success" && (
          <>
            <CardHeader className="pb-4 space-y-3">
              <div className="mx-auto flex size-16 items-center justify-center text-4xl select-none">
                😢
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                You Have Been Unsubscribed 😢
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-muted-foreground px-2">
                We&apos;re sorry to see you leave our community. Your email preferences have been
                updated and you will no longer receive newsletter or promotional emails from us.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {email && (
                <div className="inline-block rounded-full bg-muted px-3.5 py-1 text-xs font-mono text-muted-foreground">
                  {email}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <Button asChild className="w-full gap-2 py-5">
                <Link href="/">
                  <Home className="size-4" /> Go to Home Page
                </Link>
              </Button>
            </CardFooter>
          </>
        )}

        {/* 4. Error State */}
        {status === "error" && (
          <>
            <CardHeader className="pb-4 space-y-3">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <XCircle className="size-6" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                Unable to Unsubscribe
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-muted-foreground px-2">
                {errorMessage || "The link may be invalid or expired."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-2 pt-2">
              {token && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUnsubscribe}
                  className="w-full"
                >
                  Try Again
                </Button>
              )}
              <Button asChild className="w-full gap-2 py-5">
                <Link href="/">
                  <Home className="size-4" /> Go to Home Page
                </Link>
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
