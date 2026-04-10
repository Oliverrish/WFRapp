"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

export default function TemplatesPage() {
  return (
    <>
      <AdminPageHeader
        title="Template Library"
        description="Maintain the reusable event templates that shape system-wide event creation."
      />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={FileText}
          title="Reusable event templates"
          description="Create and manage the standard templates advisors rely on when creating new events."
        />
      </div>
    </>
  );
}
