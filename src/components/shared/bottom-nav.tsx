"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, ClipboardCheck, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

const items = [
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Check-in", href: "/events", icon: ClipboardCheck },
  { label: "Files", href: "/files", icon: FolderOpen },
];

export function BottomNav() {
  const pathname = usePathname();
  const { hideChrome } = useSidebar();

  // Hide on admin/super-admin routes or when chrome is hidden
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/super-admin") ||
    hideChrome
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
