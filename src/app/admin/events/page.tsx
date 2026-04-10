"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Users, Search } from "lucide-react";
import { format } from "date-fns";
import type { EventStatus } from "@/types";

interface EventData {
  id: string;
  title: string;
  status: EventStatus;
  locationName: string | null;
  startDatetime: string;
  endDatetime: string;
  capacity: number | null;
  registrationCount: number;
  checkedInCount: number;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filterBySearch = (list: EventData[]) =>
    search
      ? list.filter((e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          (e.locationName?.toLowerCase().includes(search.toLowerCase()) ?? false)
        )
      : list;

  const scheduled = filterBySearch(events.filter((e) => e.status === "scheduled"));
  const live = filterBySearch(events.filter((e) => e.status === "live"));
  const pending = filterBySearch(events.filter((e) => e.status === "pending_approval"));
  const completed = filterBySearch(events.filter((e) => e.status === "completed"));
  const drafts = filterBySearch(events.filter((e) => e.status === "draft"));
  const cancelled = filterBySearch(events.filter((e) => e.status === "cancelled"));
  const all = filterBySearch(events);

  return (
    <>
      <AdminPageHeader
        title="All Events"
        description="View and manage events across all advisors"
      />
      <div className="p-4 md:p-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 flex-wrap">
            <TabsTrigger value="all">All ({all.length})</TabsTrigger>
            <TabsTrigger value="live">Live ({live.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({scheduled.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
          </TabsList>

          {(["all", "live", "scheduled", "pending", "completed", "drafts", "cancelled"] as const).map((tab) => {
            const tabEvents = {
              all, live, scheduled, pending, completed, drafts, cancelled,
            }[tab];
            return (
              <TabsContent key={tab} value={tab}>
                <EventTable events={tabEvents} loading={loading} />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </>
  );
}

function EventTable({ events, loading }: { events: EventData[]; loading: boolean }) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          <LoadingSkeleton variant="list-item" count={5} />
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No events"
        description="No events match the current filter."
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-0 divide-y divide-border">
        {events.map((event) => {
          const start = new Date(event.startDatetime);
          const end = new Date(event.endDatetime);
          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="flex items-center gap-4 px-4 md:px-6 py-4 hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground text-xs">
                <span className="font-bold leading-none">{format(start, "d")}</span>
                <span className="text-[10px] uppercase leading-none mt-0.5">{format(start, "MMM")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {event.title}
                  </p>
                  <StatusBadge status={event.status} />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(start, "h:mm a")} - {format(end, "h:mm a")}
                  </span>
                  {event.locationName && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3" />
                      {event.locationName}
                    </span>
                  )}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 shrink-0 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{event.checkedInCount}/{event.registrationCount}</span>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
