"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { DashboardRangeForm } from "@/components/admin/dashboard-range-form";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { companyDisplayName } from "@/data/site";
import { useCompanyBasicInfo } from "@/providers/company-basic-info-provider";

import { AdminSidebar } from "./admin-sidebar";
import { findAdminTrail } from "./sidebar";

export function AdminShell({
  email,
  name,
  signOut,
  headerSignOut,
  children,
}: {
  email?: string | null;
  name?: string | null;
  signOut: ReactNode;
  headerSignOut: ReactNode;
  children: ReactNode;
}) {
  const company = useCompanyBasicInfo();
  const brandName = companyDisplayName(company.companyName);
  const pathname = usePathname();
  const trail = findAdminTrail(pathname) ?? [];
  const current = trail.at(-1);
  const displayName = name?.trim() || email || "Admin";

  return (
    <SidebarProvider
      className="admin-shell"
      style={{ "--sidebar-width": "17.5rem" } as React.CSSProperties}
    >
      <AdminSidebar email={email} signOut={signOut} />
      <SidebarInset className="bg-[#f3f6f8]">
        <header className="px-4 pt-5 md:px-6">
          <div className="mb-3 flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <Breadcrumb>
              <BreadcrumbList className="text-sm text-[#667085]">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/admin/dashboard">{brandName}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {trail.map((item, index) => {
                  const last = index === trail.length - 1;
                  return (
                    <span key={`${item.title}-${item.href ?? index}`} className="contents">
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {last ? (
                          <BreadcrumbPage className="text-[#667085]">{item.title}</BreadcrumbPage>
                        ) : item.href ? (
                          <BreadcrumbLink asChild>
                            <Link href={item.href}>{item.title}</Link>
                          </BreadcrumbLink>
                        ) : (
                          <span>{item.title}</span>
                        )}
                      </BreadcrumbItem>
                    </span>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-[1.75rem] leading-none font-semibold tracking-tight text-[#1a1d21]">
                {current?.title ?? "Admin"}
              </h1>
              {current?.description ? (
                <p className="mt-2 max-w-xl text-sm text-[#667085]">
                  {current.description.endsWith(".")
                    ? current.description
                    : `${current.description}.`}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3 xl:justify-end">
              {pathname === "/admin/dashboard" ? (
                <Suspense fallback={null}>
                  <DashboardRangeForm />
                </Suspense>
              ) : null}
              <div className="flex shrink-0 items-center gap-3 rounded-xl border border-[#e6eaee] bg-white px-3 py-2 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <div className="min-w-0 text-right">
                  <p className="max-w-60 truncate text-sm font-medium text-[#1a1d21]">
                    {displayName}
                  </p>
                  <p className="text-[10px] font-medium tracking-[0.08em] text-[#98a2b3] uppercase">
                    Admin
                  </p>
                </div>
                {headerSignOut}
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 px-4 py-5 md:px-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
