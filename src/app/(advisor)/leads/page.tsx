"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

export default function LeadsPage() {
  return (
    <>
      <PageHeader title="Leads" description="All your event attendees stored as leads" />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={Users}
          title="Your Leads"
          description="All your event attendees are stored here as leads. Track their event history and follow up."
        />
      </div>
    </>
  );
}
