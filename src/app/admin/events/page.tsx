"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Calendar } from "lucide-react";

export default function AdminEventsPage() {
  return (
    <>
      <AdminPageHeader
        title="Event Operations"
        description="Manage the full event catalog across every advisor, location, and approval state."
      />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={Calendar}
          title="System-wide event catalog"
          description="Review, filter, and manage every event in the platform from one administrative surface."
        />
      </div>
    </>
  );
}
