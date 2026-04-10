"use client";

import { useAuth } from "@/lib/auth/context";
import { useSidebar } from "./sidebar-context";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";

export function Header({ title }: { title: string }) {
  const { logout } = useAuth();
  const { isMobile, hideChrome, open } = useSidebar();

  if (isMobile && hideChrome) return null;

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/95 backdrop-blur-sm px-4 md:px-8 py-3 md:py-5">
      <div className="flex items-center gap-3">
        <button
          onClick={open}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-lg md:text-2xl font-semibold text-foreground">{title}</h1>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={logout}
        className="hidden lg:flex gap-2 text-sm"
      >
        Log out
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}
