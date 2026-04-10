"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { UserCog } from "lucide-react";

export default function UsersPage() {
  return (
    <>
      <PageHeader title="User Management" description="Create and manage all user accounts" />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={UserCog}
          title="User Management"
          description="Create, edit, and manage all user accounts. Assign roles (advisor, admin, super admin)."
        />
      </div>
    </>
  );
}
