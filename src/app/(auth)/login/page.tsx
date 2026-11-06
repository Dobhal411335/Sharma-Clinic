import { Suspense } from "react";
import Image from "next/image";

import { companyDisplayName, pageSeo } from "@/data/site";
import { getCompanyBasicInfo } from "@/features/company-basic-info/company-basic-info.service";

import { LoginForm } from "./login-form";

const LOGIN_IMAGE =
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80";

export const metadata = {
  title: pageSeo.login.title,
  description: pageSeo.login.description,
};

export default async function LoginPage() {
  const company = await getCompanyBasicInfo();
  const clinicName = companyDisplayName(company.companyName);

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative min-h-56 lg:min-h-screen">
        <Image
          src={LOGIN_IMAGE}
          alt="Bright clinic corridor"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-[#102a43]/45" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
          <p className="text-sm font-semibold tracking-[0.16em] uppercase">{clinicName}</p>
          <h1 className="mt-2 max-w-md text-3xl font-semibold tracking-tight sm:text-4xl">
            Staff sign in
          </h1>
          <p className="mt-3 max-w-sm text-sm text-white/85">
            Administrators and doctors use separate sign-in tabs. Patients do not need an account.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-[#f8fbfc] px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <p className="text-sm font-semibold tracking-[0.14em] text-[#146c94] uppercase">
            {clinicName}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#102a43]">Welcome back</h2>
          <p className="mt-2 text-sm text-[#5b6b7c]">Choose Admin or Doctor, then sign in.</p>

          <div className="mt-8 rounded-xl border border-[#d9e5ea] bg-white p-6 shadow-[0_12px_40px_-24px_rgba(16,42,67,0.45)] sm:p-8">
            <Suspense fallback={<div className="h-64 animate-pulse rounded-md bg-[#e8f2f7]" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
