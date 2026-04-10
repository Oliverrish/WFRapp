"use client";

import { AuthProvider } from "@/lib/auth/context";
import { SidebarProvider } from "./sidebar-context";
import { Sidebar } from "./sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { BottomNav } from "./bottom-nav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

export function AppShell({ children, showBottomNav = false }: AppShellProps) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <MobileSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <main
              className={cn(
                "flex-1 overflow-y-auto bg-wfr-bg-warm",
                showBottomNav && "pb-16 md:pb-0"
              )}
            >
              {children}
            </main>
            {showBottomNav && <BottomNav />}
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
