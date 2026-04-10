"use client";

import { AppShell } from "@/components/shared/app-shell";

export default function AdvisorLayout({ children }: { children: React.ReactNode }) {
  return <AppShell showBottomNav>{children}</AppShell>;
}
