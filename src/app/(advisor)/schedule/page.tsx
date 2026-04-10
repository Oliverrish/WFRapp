"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Calendar } from "lucide-react";

export default function SchedulePage() {
  return (
    <>
      <PageHeader title="Event Schedule" description="Your calendar view of all scheduled events" />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={Calendar}
          title="Event Schedule"
          description="Your calendar view of all scheduled events will appear here."
          action={{ label: "Create Event", href: "/events/new" }}
        />
      </div>
    </>
  );
}
