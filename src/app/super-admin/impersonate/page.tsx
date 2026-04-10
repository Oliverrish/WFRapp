"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Eye } from "lucide-react";

export default function ImpersonatePage() {
  return (
    <>
      <PageHeader title="Impersonate Advisor" description="View the app as any advisor" />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={Eye}
          title="Impersonate Advisor"
          description="View the app as any advisor for support and troubleshooting. All actions are logged."
        />
      </div>
    </>
  );
}
