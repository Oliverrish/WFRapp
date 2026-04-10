"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Calendar, Users, CheckSquare, TrendingDown, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { EventStatus } from "@/types";

interface DashboardEvent {
  id: string;
  title: string;
  status: EventStatus;
  locationName: string | null;
  startDatetime: string;
  registrationCount: number;
  checkedInCount: number;
}

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalEvents = events.length;
  const upcomingEvents = events.filter((e) => ["scheduled", "live"].includes(e.status));
  const pendingApprovals = events.filter((e) => e.status === "pending_approval");

  const totalRegistrations = events.reduce((acc, e) => acc + e.registrationCount, 0);
  const totalCheckedIn = events.reduce((acc, e) => acc + e.checkedInCount, 0);
  const checkInRate = totalRegistrations > 0
    ? Math.round((totalCheckedIn / totalRegistrations) * 100)
    : 0;
  const noShowRate = totalRegistrations > 0 ? 100 - checkInRate : 0;

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of all advisor activity" />
      <div className="p-4 md:p-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            label="Total Events"
            value={totalEvents}
            icon={Calendar}
            trend={`${upcomingEvents.length} upcoming`}
            trendDirection="neutral"
            iconBg="bg-wfr-bg-cool"
            loading={loading}
          />
          <StatCard
            label="Pending Approvals"
            value={pendingApprovals.length}
            icon={CheckSquare}
            trend={pendingApprovals.length > 0 ? "Needs review" : "All clear"}
            trendDirection={pendingApprovals.length > 0 ? "down" : "up"}
            iconBg="bg-wfr-warning-light"
            loading={loading}
          />
          <StatCard
            label="Check-in Rate"
            value={`${checkInRate}%`}
            icon={Users}
            trend={`${totalCheckedIn} of ${totalRegistrations} attendees`}
            trendDirection="up"
            iconBg="bg-wfr-success-light"
            loading={loading}
          />
          <StatCard
            label="No-show Rate"
            value={`${noShowRate}%`}
            icon={TrendingDown}
            trend={`${totalRegistrations - totalCheckedIn} no-shows`}
            trendDirection="down"
            iconBg="bg-destructive/10"
            loading={loading}
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="divide-y divide-border">
                  <LoadingSkeleton variant="list-item" count={3} />
                </div>
              ) : upcomingEvents.length === 0 ? (
                <p className="px-6 pb-6 text-muted-foreground">No upcoming events.</p>
              ) : (
                <div className="divide-y divide-border">
                  {upcomingEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs">
                        <span className="font-bold leading-none">
                          {format(new Date(event.startDatetime), "d")}
                        </span>
                        <span className="text-[10px] uppercase leading-none mt-0.5">
                          {format(new Date(event.startDatetime), "MMM")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                        {event.locationName && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {event.locationName}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={event.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-wfr-warning" />
                Pending Approvals
                {pendingApprovals.length > 0 && (
                  <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-wfr-warning text-white text-xs font-bold">
                    {pendingApprovals.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="divide-y divide-border">
                  <LoadingSkeleton variant="list-item" count={3} />
                </div>
              ) : pendingApprovals.length === 0 ? (
                <p className="px-6 pb-6 text-muted-foreground">No events pending approval.</p>
              ) : (
                <div className="divide-y divide-border">
                  {pendingApprovals.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-wfr-warning-light">
                        <Clock className="h-5 w-5 text-wfr-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.startDatetime), "MMM d, yyyy")} &middot; {event.registrationCount} registrations
                        </p>
                      </div>
                      <StatusBadge status="pending_approval" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
