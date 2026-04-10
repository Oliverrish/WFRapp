"use client";

import { useSidebar } from "./sidebar-context";
import { SidebarContent } from "./sidebar";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

export function MobileSidebar() {
  const { isMobile, isOpen, close } = useSidebar();

  if (!isMobile) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="left" className="w-64 p-0 bg-primary border-none [&>button]:hidden">
        <SidebarContent collapsed={false} onNavClick={close} />
      </SheetContent>
    </Sheet>
  );
}
