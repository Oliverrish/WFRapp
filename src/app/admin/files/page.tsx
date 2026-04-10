"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderOpen } from "lucide-react";

export default function AdminFilesPage() {
  return (
    <>
      <PageHeader title="File Templates" description="Manage shared file templates" />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={FolderOpen}
          title="Shared Templates"
          description="Manage shared file templates that all advisors can access."
        />
      </div>
    </>
  );
}
