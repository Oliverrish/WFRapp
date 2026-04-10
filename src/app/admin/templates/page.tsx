"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

export default function TemplatesPage() {
  return (
    <>
      <PageHeader title="Event Templates" description="Create reusable event templates" />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={FileText}
          title="Event Templates"
          description="Create and manage reusable event templates for advisors."
        />
      </div>
    </>
  );
}
