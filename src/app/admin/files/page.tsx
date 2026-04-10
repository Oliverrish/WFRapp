"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderOpen } from "lucide-react";

export default function AdminFilesPage() {
  return (
    <>
      <AdminPageHeader
        title="Shared Assets"
        description="Manage system-wide file templates, collateral, and shared documents."
      />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={FolderOpen}
          title="Shared files and collateral"
          description="Control the shared file library that supports event delivery across the platform."
        />
      </div>
    </>
  );
}
