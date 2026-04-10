import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireMinimumRole } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Platform Control | WFR App",
};

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireMinimumRole("super_admin");

  return <AdminShell initialUser={user}>{children}</AdminShell>;
}
