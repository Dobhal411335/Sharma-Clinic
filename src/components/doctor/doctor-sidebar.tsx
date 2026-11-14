"use client";

import {
  ClipboardList,
  IdCard,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { companyDisplayName } from "@/data/site";
import { useCompanyBasicInfo } from "@/providers/company-basic-info-provider";

import { doctorNav, type DoctorIconName } from "./sidebar";

const ICONS: Record<DoctorIconName, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "clipboard-list": ClipboardList,
  "id-card": IdCard,
};

function NavIcon({ name }: { name?: DoctorIconName }) {
  if (!name) return null;
  const Icon = ICONS[name];
  return <Icon aria-hidden className="size-4 shrink-0" strokeWidth={1.5} />;
}

export function DoctorSidebar({
  email,
  signOut,
}: {
  email?: string | null;
  signOut: ReactNode;
}) {
  const company = useCompanyBasicInfo();
  const brandName = companyDisplayName(company.companyName);
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <p className="text-xs text-white/70">Doctor</p>
        <p className="mt-1 text-base leading-snug font-medium text-white">{brandName}</p>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarMenu>
              {doctorNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.href === pathname ||
                      (item.href !== "/doctor/dashboard" &&
                        pathname.startsWith(`${item.href}/`))
                    }
                    tooltip={item.title}
                    className="data-[active=true]:bg-white data-[active=true]:text-black data-[active=true]:hover:bg-white data-[active=true]:hover:text-black"
                  >
                    <Link href={item.href}>
                      <NavIcon name={item.icon} />
                      <span className="font-serif text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {email ? <p className="truncate px-2 text-xs text-white">{email}</p> : null}
        {signOut}
      </SidebarFooter>
    </Sidebar>
  );
}
