import type { ReactNode } from "react";
import {
  Calendar,
  ClipboardCheck,
  FilePlus,
  FileText,
  FolderOpen,
  Shield,
  UserCog,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

export function isActiveNavItem(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export const advisorSidebarNavItems: NavItem[] = [
  { label: "Check-in List", href: "/events", icon: <ClipboardCheck className="h-5 w-5" /> },
  { label: "Event Schedule", href: "/schedule", icon: <Calendar className="h-5 w-5" /> },
  { label: "Add Event", href: "/events/new", icon: <FilePlus className="h-5 w-5" /> },
  { label: "Drafts", href: "/drafts", icon: <FileText className="h-5 w-5" /> },
  { label: "My Folder", href: "/files", icon: <FolderOpen className="h-5 w-5" /> },
];

export const advisorBottomNavItems: NavItem[] = [
  { label: "Events", href: "/events", icon: <ClipboardCheck className="h-5 w-5" /> },
  { label: "Drafts", href: "/drafts", icon: <FileText className="h-5 w-5" /> },
  { label: "Files", href: "/files", icon: <FolderOpen className="h-5 w-5" /> },
];

export const adminSidebarNavItems: NavItem[] = [
  { label: "Admin Console", href: "/admin/dashboard", icon: <Shield className="h-5 w-5" /> },
];

export const superAdminSidebarNavItems: NavItem[] = [
  { label: "Platform Controls", href: "/super-admin/users", icon: <UserCog className="h-5 w-5" /> },
];
