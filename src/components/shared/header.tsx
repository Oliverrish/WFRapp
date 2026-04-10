"use client";

import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Header({ title }: { title: string }) {
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-[#e5e5e5] bg-white px-8 py-5">
      <h1 className="text-2xl font-semibold text-[#1a1a2e]">{title}</h1>
      <Button
        variant="outline"
        size="sm"
        onClick={logout}
        className="gap-2 text-sm"
      >
        Log out
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}
