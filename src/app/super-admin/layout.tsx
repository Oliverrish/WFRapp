"use client";

import { AppShell } from "@/components/shared/app-shell";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
