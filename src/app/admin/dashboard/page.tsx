"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  CheckSquare,
  FileText,
  FolderOpen,
  MapPin,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      .then((response) => response.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalEvents = events.length;
  const liveEvents = events.filter((event) => event.status === "live");
  const scheduledEvents = events.filter((event) => event.status === "scheduled");
  const upcomingEvents = events.filter((event) =>
    ["scheduled", "live"].includes(event.status)
  );
  const pendingApprovals = events.filter(
    (event) => event.status === "pending_approval"
  );
  const totalRegistrations = events.reduce(
    (count, event) => count + event.registrationCount,
    0
  );
  const totalCheckedIn = events.reduce(
    (count, event) => count + event.checkedInCount,
    0
  );

  const actionCards = [
    {
      href: "/admin/approvals",
      label: "Approval queue",
      description: "Review submitted events waiting for an admin decision.",
      count: pendingApprovals.length,
      icon: CheckSquare,
      tone: "bg-amber-100 text-amber-800",
    },
    {
      href: "/admin/events",
      label: "Event operations",
      description: "Manage the full event catalog across every advisor and status.",
      count: totalEvents,
      icon: Calendar,
      tone: "bg-sky-100 text-sky-800",
    },
    {
      href: "/admin/templates",
      label: "Template library",
      description: "Control shared templates and files used throughout the system.",
      count: "Shared",
      icon: FileText,
      tone: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Operations Overview"
        description="This console administers the entire event system. It is separate from the advisor workspace and focused on platform-wide operations."
      />

      <div className="space-y-6 p-4 md:p-8">
        <Card className="border-slate-200/80 bg-slate-950 text-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.7)]">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-2xl">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-sky-300">
                  Dedicated Control Surface
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  Admin runs the platform, not the advisor check-in workflow.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                  Use this area to govern system-wide events, approvals, advisors,
                  templates, and shared assets without mixing that work into the daily
                  advisor dashboard.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <OverviewPill label="Pending" value={pendingApprovals.length} />
                <OverviewPill label="Live now" value={liveEvents.length} />
                <OverviewPill label="Registrations" value={totalRegistrations} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-3">
          {actionCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-[24px] border border-slate-200/80 bg-white/88 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_30px_70px_-40px_rgba(15,23,42,0.4)]"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${card.tone}`}
                >
                  <card.icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                  {card.count}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-semibold text-slate-950">
                {card.label}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {card.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Events"
            value={totalEvents}
            icon={Calendar}
            trend={`${scheduledEvents.length} scheduled`}
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
            label="Live Events"
            value={liveEvents.length}
            icon={Users}
            trend={`${upcomingEvents.length} upcoming total`}
            trendDirection="up"
            iconBg="bg-wfr-success-light"
            loading={loading}
          />
          <StatCard
            label="Registrations"
            value={totalRegistrations}
            icon={FolderOpen}
            trend={`${totalCheckedIn} attendees checked in`}
            trendDirection="neutral"
            iconBg="bg-slate-200"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Events Across The System
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
                      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary text-xs text-primary-foreground">
                        <span className="font-bold leading-none">
                          {format(new Date(event.startDatetime), "d")}
                        </span>
                        <span className="mt-0.5 text-[10px] uppercase leading-none">
                          {format(new Date(event.startDatetime), "MMM")}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {event.title}
                        </p>
                        {event.locationName && (
                          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckSquare className="h-5 w-5 text-wfr-warning" />
                Approval Queue
                {pendingApprovals.length > 0 && (
                  <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-wfr-warning text-xs font-bold text-white">
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
                <p className="px-6 pb-6 text-muted-foreground">
                  No events pending approval.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {pendingApprovals.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-wfr-warning-light">
                        <CheckSquare className="h-5 w-5 text-wfr-warning" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {event.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.startDatetime), "MMM d, yyyy")} &middot;{" "}
                          {event.registrationCount} registrations
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

function OverviewPill({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
