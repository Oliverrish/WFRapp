"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import {
  Calendar,
  ClipboardCheck,
  FilePlus,
  FileText,
  FolderOpen,
  Users,
  LayoutDashboard,
  CheckSquare,
  Settings,
  LogOut,
  Shield,
  UserCog,
  Eye,
  BarChart3,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const advisorNav: NavItem[] = [
  {
    label: "Check-in List",
    href: "/events",
    icon: <ClipboardCheck className="h-5 w-5" />,
  },
  {
    label: "Event Schedule",
    href: "/schedule",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: "Add Event",
    href: "/events/new",
    icon: <FilePlus className="h-5 w-5" />,
  },
  {
    label: "Drafts",
    href: "/drafts",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "My Folder",
    href: "/files",
    icon: <FolderOpen className="h-5 w-5" />,
  },
];

const adminNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "All Events",
    href: "/admin/events",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: "Approvals",
    href: "/admin/approvals",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    label: "Advisors",
    href: "/admin/advisors",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Templates",
    href: "/admin/templates",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Reports",
    href: "/admin/dashboard",
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

const superAdminNav: NavItem[] = [
  {
    label: "User Management",
    href: "/super-admin/users",
    icon: <UserCog className="h-5 w-5" />,
  },
  {
    label: "Admin Scopes",
    href: "/super-admin/scopes",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    label: "Impersonate",
    href: "/super-admin/impersonate",
    icon: <Eye className="h-5 w-5" />,
  },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed?: boolean }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-white/15 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white",
        collapsed && "justify-center px-2"
      )}
    >
      {item.icon}
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#1e3a5f] text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <span className="text-sm font-bold text-[#d4a441]">W</span>
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">WORKSHOPS FOR</p>
          <p className="text-xs font-medium text-[#d4a441] leading-tight">
            RETIREMENT
          </p>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Advisor Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {advisorNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <Separator className="my-4 bg-white/10" />
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
              Admin
            </p>
            {adminNav.map((item) => (
              <NavLink key={item.href + item.label} item={item} />
            ))}
          </>
        )}

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <>
            <Separator className="my-4 bg-white/10" />
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
              System
            </p>
            {superAdminNav.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </>
        )}
      </nav>

      {/* User Footer */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-white/10 text-sm text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-white/50 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-white/30">v2.00</p>
      </div>
    </aside>
  );
}
