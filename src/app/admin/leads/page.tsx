"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

export default function AdminLeadsPage() {
  return (
    <>
      <PageHeader title="All Leads" description="View leads across all advisors" />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={Users}
          title="All Leads"
          description="View leads across all advisors (based on your admin scope)."
        />
      </div>
    </>
  );
}
