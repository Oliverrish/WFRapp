"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Eye } from "lucide-react";

export default function ImpersonatePage() {
  return (
    <>
      <AdminPageHeader
        title="Impersonation"
        description="Open the advisor workspace as another user for support, QA, and troubleshooting."
        eyebrow="Platform Control"
      />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={Eye}
          title="Support access"
          description="View the application as any advisor for support and troubleshooting. All actions are logged."
        />
      </div>
    </>
  );
}
