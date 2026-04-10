"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CheckSquare } from "lucide-react";

export default function ApprovalsPage() {
  return (
    <>
      <PageHeader title="Event Approvals" description="Review and approve advisor event submissions" />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={CheckSquare}
          title="Event Approvals"
          description="Review, approve, reject, or request changes on advisor event submissions."
        />
      </div>
    </>
  );
}
