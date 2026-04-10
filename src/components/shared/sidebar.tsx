"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useSidebar } from "./sidebar-context";
import {
  Calendar,
  ClipboardCheck,
  FilePlus,
  FileText,
  FolderOpen,
  Users,
  LayoutDashboard,
  CheckSquare,
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
  { label: "Check-in List", href: "/events", icon: <ClipboardCheck className="h-5 w-5" /> },
  { label: "Event Schedule", href: "/schedule", icon: <Calendar className="h-5 w-5" /> },
  { label: "Add Event", href: "/events/new", icon: <FilePlus className="h-5 w-5" /> },
  { label: "Drafts", href: "/drafts", icon: <FileText className="h-5 w-5" /> },
  { label: "My Folder", href: "/files", icon: <FolderOpen className="h-5 w-5" /> },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "All Events", href: "/admin/events", icon: <Calendar className="h-5 w-5" /> },
  { label: "Approvals", href: "/admin/approvals", icon: <CheckSquare className="h-5 w-5" /> },
  { label: "Advisors", href: "/admin/advisors", icon: <Users className="h-5 w-5" /> },
  { label: "Templates", href: "/admin/templates", icon: <FileText className="h-5 w-5" /> },
  { label: "Leads", href: "/admin/leads", icon: <Users className="h-5 w-5" /> },
  { label: "Reports", href: "/admin/dashboard", icon: <BarChart3 className="h-5 w-5" /> },
];

const superAdminNav: NavItem[] = [
  { label: "User Management", href: "/super-admin/users", icon: <UserCog className="h-5 w-5" /> },
  { label: "Admin Scopes", href: "/super-admin/scopes", icon: <Shield className="h-5 w-5" /> },
  { label: "Impersonate", href: "/super-admin/impersonate", icon: <Eye className="h-5 w-5" /> },
];

function NavLink({
  item,
  collapsed,
  onNavClick,
}: {
  item: NavItem;
  collapsed?: boolean;
  onNavClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      onClick={onNavClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-white/15 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white",
        collapsed && "justify-center px-2"
      )}
    >
      {item.icon}
      {!collapsed && <span>{item.label}</span>}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-2 rounded-md bg-foreground px-2.5 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-50 shadow-lg">
          {item.label}
        </span>
      )}
    </Link>
  );
}

// Exported for use in MobileSidebar
export function SidebarContent({
  collapsed = false,
  onNavClick,
}: {
  collapsed?: boolean;
  onNavClick?: () => void;
}) {
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
    <div className="flex h-full flex-col bg-primary text-white">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-5 py-5", collapsed && "justify-center px-3")}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
          <span className="text-sm font-bold text-accent">W</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold leading-tight">WORKSHOPS FOR</p>
            <p className="text-xs font-medium text-accent leading-tight">RETIREMENT</p>
          </div>
        )}
      </div>

      <Separator className="bg-white/10" />

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {advisorNav.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} onNavClick={onNavClick} />
        ))}

        {isAdmin && (
          <>
            <Separator className="my-4 bg-white/10" />
            {!collapsed && (
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                Admin
              </p>
            )}
            {adminNav.map((item) => (
              <NavLink key={item.href + item.label} item={item} collapsed={collapsed} onNavClick={onNavClick} />
            ))}
          </>
        )}

        {isSuperAdmin && (
          <>
            <Separator className="my-4 bg-white/10" />
            {!collapsed && (
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                System
              </p>
            )}
            {superAdminNav.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} onNavClick={onNavClick} />
            ))}
          </>
        )}
      </nav>

      {/* User Footer */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-white/10 text-sm text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight truncate">{user?.fullName}</p>
                <p className="text-xs text-white/50 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        {!collapsed && <p className="mt-2 text-center text-[10px] text-white/30">v2.00</p>}
      </div>
    </div>
  );
}

// Main responsive sidebar
export function Sidebar() {
  const { isMobile, isCollapsed } = useSidebar();

  if (isMobile) return null;

  return (
    <aside
      className={cn(
        "hidden md:flex h-screen flex-col shrink-0 transition-[width] duration-200 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent collapsed={isCollapsed} />
    </aside>
  );
}
