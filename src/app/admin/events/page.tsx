"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Calendar } from "lucide-react";

export default function AdminEventsPage() {
  return (
    <>
      <PageHeader title="All Events" description="View events across all advisors" />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={Calendar}
          title="All Events"
          description="View and manage all events across all advisors."
        />
      </div>
    </>
  );
}
