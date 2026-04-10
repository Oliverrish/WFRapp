"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

export default function AdminAdvisorsPage() {
  return (
    <>
      <PageHeader title="Advisors" description="View and manage advisor accounts" />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={Users}
          title="Advisor Management"
          description="View and manage all advisor accounts, their events, and activity."
        />
      </div>
    </>
  );
}
