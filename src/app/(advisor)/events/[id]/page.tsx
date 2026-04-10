"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ClipboardCheck } from "lucide-react";

export default function EventDetailPage() {
  return (
    <>
      <PageHeader
        title="Event Details"
        breadcrumbs={[
          { label: "Events", href: "/events" },
          { label: "Event Details" },
        ]}
      />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={ClipboardCheck}
          title="Event Details & Check-in"
          description="View event information and manage attendee check-ins here."
        />
      </div>
    </>
  );
}
