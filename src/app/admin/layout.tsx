"use client";

import { AuthProvider } from "@/lib/auth/context";
import { Sidebar } from "@/components/shared/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#faf9f7]">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
