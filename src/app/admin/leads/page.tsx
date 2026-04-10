"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

export default function AdminLeadsPage() {
  return (
    <>
      <AdminPageHeader
        title="Lead Directory"
        description="Audit leads captured across all events and advisors from one central place."
      />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={Users}
          title="System lead directory"
          description="Review leads captured across advisors and events based on your administrative scope."
        />
      </div>
    </>
  );
}
