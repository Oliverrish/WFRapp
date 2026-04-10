import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function AdvisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell initialUser={user} showBottomNav>
      {children}
    </AppShell>
  );
}
