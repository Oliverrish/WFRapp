"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

export default function AdminAdvisorsPage() {
  return (
    <>
      <AdminPageHeader
        title="Advisor Directory"
        description="Manage advisor accounts, ownership, and support operations across the system."
      />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={Users}
          title="Advisor operations"
          description="View every advisor account, inspect ownership, and support activity across all events."
        />
      </div>
    </>
  );
}
