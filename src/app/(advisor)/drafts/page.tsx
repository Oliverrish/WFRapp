"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

export default function DraftsPage() {
  return (
    <>
      <PageHeader title="Drafts" description="Events you're still working on" />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={FileText}
          title="Draft Events"
          description="Events you're still working on before submitting for approval."
          action={{ label: "Start New Event", href: "/events/new" }}
        />
      </div>
    </>
  );
}
