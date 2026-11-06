"use client";

import {
  AppWindow,
  BadgePercent,
  BriefcaseMedical,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  CircleX,
  ClipboardList,
  FilePlus,
  IdCard,
  Image,
  Images,
  IndianRupee,
  Info,
  KeyRound,
  Landmark,
  LayoutDashboard,
  Megaphone,
  Menu,
  Newspaper,
  PanelBottom,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { companyDisplayName } from "@/data/site";
import { useCompanyBasicInfo } from "@/providers/company-basic-info-provider";

import { adminNav, type AdminIconName, type AdminNavItem } from "./sidebar";

const ICONS: Record<AdminIconName, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "building-2": Building2,
  images: Images,
  menu: Menu,
  "share-2": Share2,
  "file-plus": FilePlus,
  "panel-bottom": PanelBottom,
  image: Image,
  "app-window": AppWindow,
  megaphone: Megaphone,
  info: Info,
  "badge-percent": BadgePercent,
  sparkles: Sparkles,
  "shield-check": ShieldCheck,
  "circle-help": CircleHelp,
  newspaper: Newspaper,
  star: Star,
  stethoscope: Stethoscope,
  "user-plus": UserPlus,
  "key-round": KeyRound,
  "id-card": IdCard,
  "calendar-clock": CalendarClock,
  "briefcase-medical": BriefcaseMedical,
  "clipboard-list": ClipboardList,
  landmark: Landmark,
  "circle-check": CircleCheck,
  "circle-x": CircleX,
  "calendar-check": CalendarCheck,
  "indian-rupee": IndianRupee,
  "calendar-days": CalendarDays,
  check: Check,
  "calendar-plus": CalendarPlus,
};

function NavIcon({ name }: { name?: AdminIconName }) {
  if (!name) return null;
  const Icon = ICONS[name];
  return <Icon aria-hidden className="size-4 shrink-0" strokeWidth={1.5} />;
}

const chevronClass =
  "size-4 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=open]/collapsible:rotate-90";

const wrapLabel =
  "h-auto min-h-7 whitespace-normal py-1.5 [&>span:last-child]:overflow-visible [&>span:last-child]:whitespace-normal";

function SubItems({
  items,
  pathname,
  parentId,
  isOpen,
  setOpen,
}: {
  items: AdminNavItem[];
  pathname: string;
  parentId: string;
  isOpen: (id: string) => boolean;
  setOpen: (id: string, open: boolean) => void;
}) {
  return items.map((item) => {
    const id = `${parentId}/${item.title}`;
    if (item.children?.length) {
      return (
        <SidebarMenuSubItem key={id}>
          <Collapsible
            open={isOpen(id)}
            onOpenChange={(open) => setOpen(id, open)}
            className="group/collapsible"
          >
            <CollapsibleTrigger asChild>
              <SidebarMenuSubButton asChild className={wrapLabel}>
                <button type="button">
                  <NavIcon name={item.icon} />
                  <span className="text-base font-serif font-medium text-[#17191c]">{item.title}</span>
                  <ChevronRight aria-hidden className={`ml-auto ${chevronClass}`} />
                </button>
              </SidebarMenuSubButton>
            </CollapsibleTrigger>
            <CollapsibleContent className="admin-accordion">
              <SidebarMenuSub>
                {item.children.map((child) => (
                  <SidebarMenuSubItem key={child.href}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={child.href === pathname}
                      className={wrapLabel}
                    >
                      <Link href={child.href ?? "#"}>
                        <NavIcon name={child.icon} />
                        <span className="font-serif">{child.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuSubItem>
      );
    }

    return (
      <SidebarMenuSubItem key={item.href}>
        <SidebarMenuSubButton asChild isActive={item.href === pathname} className={wrapLabel}>
          <Link href={item.href ?? "#"}>
            <NavIcon name={item.icon} />
            <span className="text-md font-serif font-medium text-white">{item.title}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  });
}

function TopItems({
  items,
  pathname,
  isOpen,
  setOpen,
}: {
  items: AdminNavItem[];
  pathname: string;
  isOpen: (id: string) => boolean;
  setOpen: (id: string, open: boolean) => void;
}) {
  return items.map((item) => {
    if (!item.children?.length) {
      return (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={item.href === pathname} tooltip={item.title}>
            <Link href={item.href ?? "#"}>
              <NavIcon name={item.icon} />
              <span className="font-serif text-base">{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    const id = item.title;

    return (
      <Collapsible
        key={id}
        open={isOpen(id)}
        onOpenChange={(open) => setOpen(id, open)}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          {item.href ? (
            <>
              <SidebarMenuButton asChild isActive={item.href === pathname} tooltip={item.title}>
                <Link href={item.href}>
                  <NavIcon name={item.icon} />
                  <span className="font-serif text-base">{item.title}</span>
                </Link>
              </SidebarMenuButton>
              <CollapsibleTrigger asChild>
                <SidebarMenuAction aria-label={`Toggle ${item.title}`}>
                  <ChevronRight className={chevronClass} />
                </SidebarMenuAction>
              </CollapsibleTrigger>
            </>
          ) : (
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={item.title} className={wrapLabel}>
                <NavIcon name={item.icon} />
                <span className="font-serif text-base" >{item.title}</span>
                <ChevronRight aria-hidden className={`ml-auto ${chevronClass}`} />
              </SidebarMenuButton>
            </CollapsibleTrigger>
          )}
          <CollapsibleContent className="admin-accordion">
            <SidebarMenuSub>
              <SubItems
                items={item.children}
                pathname={pathname}
                parentId={id}
                isOpen={isOpen}
                setOpen={setOpen}
              />
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  });
}

export function AdminSidebar({
  email,
  signOut,
}: {
  email?: string | null;
  signOut: ReactNode;
}) {
  const company = useCompanyBasicInfo();
  const brandName = companyDisplayName(company.companyName);
  const pathname = usePathname();
  const [openIds, setOpenIds] = useState<string[]>([]);
  const isOpen = (id: string) => openIds.includes(id);
  const setOpen = (id: string, open: boolean) => {
    setOpenIds((current) => {
      if (open) return current.includes(id) ? current : [...current, id];
      return current.filter((item) => item !== id);
    });
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <p className="text-xs text-white/70">Admin</p>
        <p className="mt-1 text-base leading-snug font-medium text-white">{brandName}</p>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarMenu>
              <TopItems items={adminNav} pathname={pathname} isOpen={isOpen} setOpen={setOpen} />
            </SidebarMenu>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {email ? <p className="truncate px-2 text-xs text-white/70">{email}</p> : null}
        {signOut}
      </SidebarFooter>
    </Sidebar>
  );
}
