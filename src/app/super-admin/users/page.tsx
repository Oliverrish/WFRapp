"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { UserCog } from "lucide-react";

export default function UsersPage() {
  return (
    <>
      <AdminPageHeader
        title="Platform Users"
        description="Create and manage every user account and role in the system."
        eyebrow="Platform Control"
      />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={UserCog}
          title="Global user administration"
          description="Create, edit, and manage user accounts with advisor, admin, and super admin roles."
        />
      </div>
    </>
  );
}
