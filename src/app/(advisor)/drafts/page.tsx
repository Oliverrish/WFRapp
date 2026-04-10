"use client";

import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function DraftsPage() {
  return (
    <>
      <Header title="Drafts" />
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f4f8]">
              <FileText className="h-8 w-8 text-[#1e3a5f]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1a1a2e]">
              Draft Events
            </h2>
            <p className="mt-2 max-w-sm text-base text-[#64748b]">
              Events you&apos;re still working on before submitting for approval.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
