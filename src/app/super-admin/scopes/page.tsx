"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Shield } from "lucide-react";

export default function ScopesPage() {
  return (
    <>
      <PageHeader title="Admin Scopes" description="Configure admin access permissions" />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={Shield}
          title="Admin Scopes"
          description="Configure which advisors and data each admin can access."
        />
      </div>
    </>
  );
}
