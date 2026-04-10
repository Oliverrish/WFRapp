"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Plus, MapPin, Clock, Users } from "lucide-react";
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

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = events.filter((e) => ["scheduled", "live"].includes(e.status));
  const past = events.filter((e) => ["completed", "cancelled"].includes(e.status));

  return (
    <>
      <PageHeader
        title="Events"
        description="Manage your upcoming and past workshops"
        actions={
          <Link
            href="/events/new"
            className={`${buttonVariants({ variant: "default" })} bg-accent text-accent-foreground hover:bg-wfr-gold-hover font-semibold gap-2`}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Event</span>
          </Link>
        }
      />
      <div className="p-4 md:p-8">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Upcoming {upcoming.length > 0 && `(${upcoming.length})`}
            </TabsTrigger>
            <TabsTrigger value="past">
              Past {past.length > 0 && `(${past.length})`}
            </TabsTrigger>
            <TabsTrigger value="all">
              All {events.length > 0 && `(${events.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <EventList events={upcoming} loading={loading} />
          </TabsContent>
          <TabsContent value="past">
            <EventList events={past} loading={loading} />
          </TabsContent>
          <TabsContent value="all">
            <EventList events={events} loading={loading} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function EventList({ events, loading }: { events: EventData[]; loading: boolean }) {
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
        title="No events yet"
        description="Create your first event to start managing workshops and check-ins."
        action={{ label: "Create Event", href: "/events/new", variant: "accent" }}
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-0 divide-y divide-border">
        {events.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </CardContent>
    </Card>
  );
}

function EventRow({ event }: { event: EventData }) {
  const start = new Date(event.startDatetime);
  const end = new Date(event.endDatetime);
  const month = format(start, "MMM");
  const day = format(start, "d");
  const timeRange = `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
  const attendeeRatio = event.capacity
    ? `${event.checkedInCount}/${event.capacity}`
    : `${event.registrationCount} registered`;
  const percentage = event.capacity
    ? Math.round((event.checkedInCount / event.capacity) * 100)
    : null;

  return (
    <Link
      href={event.status === "live" ? `/check-in/${event.id}` : `/events/${event.id}`}
      className="flex items-center gap-4 px-4 md:px-6 py-4 hover:bg-secondary/50 transition-colors group"
    >
      {/* Date tile */}
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <span className="text-xs font-medium uppercase leading-none">{month}</span>
        <span className="text-xl font-bold leading-tight">{day}</span>
      </div>

      {/* Event info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {event.title}
          </p>
          <StatusBadge status={event.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {timeRange}
          </span>
          {event.locationName && (
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5" />
              {event.locationName}
            </span>
          )}
        </div>
      </div>

      {/* Attendee count */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{attendeeRatio}</span>
        {percentage !== null && (
          <span className="text-xs text-muted-foreground">({percentage}%)</span>
        )}
      </div>
    </Link>
  );
}
