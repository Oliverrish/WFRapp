"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ClipboardCheck,
  Edit,
  Trash2,
  Send,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { EventStatus } from "@/types";

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  status: EventStatus;
  locationName: string | null;
  locationAddress: string | null;
  startDatetime: string;
  endDatetime: string;
  capacity: number | null;
  notes: string | null;
  timezone: string | null;
}

interface Attendee {
  registrationId: string;
  status: "registered" | "checked_in" | "no_show";
  checkedInAt: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [regCount, setRegCount] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then((r) => r.json())
      .then((data) => {
        setEvent(data.event);
        setAttendees(data.attendees ?? []);
        setRegCount(data.registrationCount ?? 0);
        setCheckedInCount(data.checkedInCount ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleSubmitForApproval = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/submit`, { method: "POST" });
      if (res.ok) {
        toast.success("Event submitted for approval");
        setEvent((prev) => prev ? { ...prev, status: "pending_approval" } : prev);
      } else {
        toast.error("Failed to submit");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Event deleted");
        window.location.href = "/events";
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Event Details" breadcrumbs={[{ label: "Events", href: "/events" }, { label: "Loading..." }]} />
        <div className="p-4 md:p-8 space-y-4">
          <LoadingSkeleton variant="card" count={2} />
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <PageHeader title="Event Not Found" breadcrumbs={[{ label: "Events", href: "/events" }, { label: "Not Found" }]} />
        <div className="p-4 md:p-8">
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-lg text-muted-foreground">This event could not be found.</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const start = new Date(event.startDatetime);
  const end = new Date(event.endDatetime);
  const percentage = regCount > 0 ? Math.round((checkedInCount / regCount) * 100) : 0;
  const canCheckIn = event.status === "live" || event.status === "scheduled";
  const canEdit = event.status === "draft" || event.status === "pending_approval";
  const canSubmit = event.status === "draft";

  return (
    <>
      <PageHeader
        title={event.title}
        breadcrumbs={[{ label: "Events", href: "/events" }, { label: event.title }]}
        actions={
          <div className="flex items-center gap-2">
            {canCheckIn && (
              <Link href={`/check-in/${event.id}`}>
                <Button className="bg-accent text-accent-foreground hover:bg-wfr-gold-hover font-semibold gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Check-in</span>
                </Button>
              </Link>
            )}
            {canEdit && (
              <Link href={`/events/new?edit=${event.id}`}>
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              </Link>
            )}
          </div>
        }
      />
      <div className="p-4 md:p-8 space-y-6">
        {/* Event Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">Event Information</CardTitle>
                <StatusBadge status={event.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.description && (
                <p className="text-base text-muted-foreground">{event.description}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{format(start, "EEEE, MMMM d, yyyy")}</p>
                    <p className="text-sm text-muted-foreground">{event.timezone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {format(start, "h:mm a")} - {format(end, "h:mm a")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((end.getTime() - start.getTime()) / 60000)} minutes
                    </p>
                  </div>
                </div>
                {event.locationName && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.locationName}</p>
                      {event.locationAddress && (
                        <p className="text-sm text-muted-foreground">{event.locationAddress}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {event.notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-1">Internal Notes</p>
                  <p className="text-sm text-muted-foreground">{event.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {canSubmit && (
                  <Button
                    onClick={handleSubmitForApproval}
                    disabled={actionLoading}
                    className="bg-primary hover:bg-wfr-navy-light gap-2"
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit for Approval
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">Attendance</p>
                <p className="text-4xl font-bold text-foreground mt-1">
                  {checkedInCount}<span className="text-muted-foreground text-2xl">/{regCount}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">{percentage}% checked in</p>
                {event.capacity && (
                  <p className="text-xs text-muted-foreground mt-2">Capacity: {event.capacity}</p>
                )}
              </CardContent>
            </Card>

            {canCheckIn && (
              <Link href={`/check-in/${event.id}`} className="block">
                <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <ClipboardCheck className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p className="text-base font-semibold text-foreground">Open Check-in</p>
                    <p className="text-sm text-muted-foreground mt-1">Manage attendees live</p>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </div>

        {/* Attendee List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Attendees ({regCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {attendees.length === 0 ? (
              <p className="px-6 py-8 text-center text-muted-foreground">No attendees registered for this event yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {attendees.map((a) => (
                  <div key={a.registrationId} className="flex items-center justify-between px-4 md:px-6 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {a.firstName} {a.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.email || a.phone || "No contact info"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        a.status === "checked_in"
                          ? "bg-wfr-success-light text-wfr-success border-wfr-success/20"
                          : a.status === "no_show"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-secondary text-muted-foreground border-border"
                      }
                    >
                      {a.status === "checked_in" ? "Checked in" : a.status === "no_show" ? "No show" : "Registered"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
