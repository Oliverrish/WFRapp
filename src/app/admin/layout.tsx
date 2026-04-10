import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireMinimumRole } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Admin Console | WFR App",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireMinimumRole("admin");

  return <AdminShell initialUser={user}>{children}</AdminShell>;
}
