"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CheckSquare,
  Eye,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  UserCog,
  Users,
} from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth/context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarProvider, useSidebar } from "@/components/shared/sidebar-context";
import { cn } from "@/lib/utils";
import type { Profile, UserRole } from "@/types";

interface AdminShellProps {
  children: React.ReactNode;
  initialUser: Profile;
}

interface NavItem {
  label: string;
  href: string;
  description: string;
  icon: React.ReactNode;
  minimumRole?: UserRole;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Operations",
    items: [
      {
        label: "Overview",
        href: "/admin/dashboard",
        description: "System-wide operations dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        label: "Events",
        href: "/admin/events",
        description: "Manage the full event catalog",
        icon: <Calendar className="h-4 w-4" />,
      },
      {
        label: "Approvals",
        href: "/admin/approvals",
        description: "Review submitted event changes",
        icon: <CheckSquare className="h-4 w-4" />,
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        label: "Advisors",
        href: "/admin/advisors",
        description: "Accounts, ownership, and support",
        icon: <Users className="h-4 w-4" />,
      },
      {
        label: "Leads",
        href: "/admin/leads",
        description: "Cross-event lead directory",
        icon: <Users className="h-4 w-4" />,
      },
      {
        label: "Templates",
        href: "/admin/templates",
        description: "Reusable event templates",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        label: "Files",
        href: "/admin/files",
        description: "Shared files and collateral",
        icon: <FolderOpen className="h-4 w-4" />,
      },
    ],
  },
  {
    label: "Platform",
    items: [
      {
        label: "Users",
        href: "/super-admin/users",
        description: "Global user administration",
        icon: <UserCog className="h-4 w-4" />,
        minimumRole: "super_admin",
      },
      {
        label: "Access Scopes",
        href: "/super-admin/scopes",
        description: "Admin permissions and coverage",
        icon: <Shield className="h-4 w-4" />,
        minimumRole: "super_admin",
      },
      {
        label: "Impersonation",
        href: "/super-admin/impersonate",
        description: "Support and QA access",
        icon: <Eye className="h-4 w-4" />,
        minimumRole: "super_admin",
      },
    ],
  },
];

export function AdminShell({ children, initialUser }: AdminShellProps) {
  return (
    <AuthProvider initialUser={initialUser}>
      <SidebarProvider>
        <AdminShellLayout>{children}</AdminShellLayout>
      </SidebarProvider>
    </AuthProvider>
  );
}

function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();
  const { user } = useAuth();
  const roleLabel =
    user?.role === "super_admin" ? "platform control" : "system admin";

  return (
    <div className="flex min-h-screen bg-[#edf3f8] text-slate-950">
      <AdminDesktopSidebar />
      <AdminMobileSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={open}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950 md:hidden"
                aria-label="Open admin navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-sky-700">
                  System Admin
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-lg font-semibold text-slate-950 md:text-xl">
                    WFR operations console
                  </h1>
                  <span className="hidden rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-sky-800 md:inline-flex">
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/events"
              className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950 sm:inline-flex"
            >
              Advisor workspace
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(30,58,95,0.08),_transparent_32%),linear-gradient(180deg,#f7f9fc_0%,#eef3f9_100%)]">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminDesktopSidebar() {
  return (
    <aside className="hidden w-[320px] shrink-0 md:flex">
      <AdminSidebarContent />
    </aside>
  );
}

function AdminMobileSidebar() {
  const { isOpen, close } = useSidebar();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[320px] max-w-[88vw] border-r border-slate-800 bg-[#0d1728] p-0 text-white"
      >
        <AdminSidebarContent onNavClick={close} />
      </SheetContent>
    </Sheet>
  );
}

function AdminSidebarContent({ onNavClick }: { onNavClick?: () => void } = {}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="flex h-full flex-col bg-[#0d1728] text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/admin/dashboard" onClick={onNavClick} className="block">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-sky-300">
            WFR Control
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Admin Console
          </h2>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-300">
            Operate every event, approval, advisor, and shared system asset from a
            dedicated workspace.
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        {navGroups.map((group) => {
          const items = group.items.filter((item) => canViewItem(user?.role, item));
          if (items.length === 0) {
            return null;
          }

          return (
            <div key={group.label}>
              <p className="px-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                {group.label}
              </p>
              <div className="mt-2 space-y-1.5">
                {items.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavClick}
                      className={cn(
                        "block rounded-2xl border px-3 py-3 transition-all",
                        isActive
                          ? "border-sky-400/40 bg-sky-400/10 shadow-[0_18px_40px_-28px_rgba(56,189,248,0.9)]"
                          : "border-transparent bg-white/3 hover:border-white/10 hover:bg-white/6"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                            isActive
                              ? "border-sky-300/30 bg-sky-300/12 text-sky-200"
                              : "border-white/10 bg-white/6 text-slate-300"
                          )}
                        >
                          {item.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white">{item.label}</p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <Link
          href="/events"
          onClick={onNavClick}
          className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition-colors hover:border-white/15 hover:bg-white/8"
        >
          <span>Open advisor workspace</span>
          <span className="text-slate-400">/events</span>
        </Link>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-sky-300/15 text-sm font-semibold text-sky-100">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.fullName ?? "Loading"}
            </p>
            <p className="truncate text-xs text-slate-400">
              {user?.email ?? "Resolving session"}
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function canViewItem(role: UserRole | undefined, item: NavItem) {
  if (!item.minimumRole) {
    return true;
  }

  return role === item.minimumRole;
}
