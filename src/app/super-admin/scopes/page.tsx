"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Shield } from "lucide-react";

export default function ScopesPage() {
  return (
    <>
      <AdminPageHeader
        title="Access Scopes"
        description="Configure which advisors, records, and capabilities each admin can operate on."
        eyebrow="Platform Control"
      />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={Shield}
          title="Administrative permissions"
          description="Control which advisors and records each admin can access, review, and edit."
        />
      </div>
    </>
  );
}
