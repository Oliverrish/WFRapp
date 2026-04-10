"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  ClipboardCheck,
  Clock,
  Loader2,
  MapPin,
  Save,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EventStatus } from "@/types";

type EventFormState = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: string;
  locationName: string;
  locationAddress: string;
  notes: string;
  timezone: string;
};

type Attendee = {
  registrationId: string;
  status: "registered" | "checked_in" | "no_show";
  checkedInAt: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

type EventResponse = {
  event: {
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
  };
  registrationCount: number;
  checkedInCount: number;
  attendees: Attendee[];
};

function toDateInputValue(value: string) {
  return format(new Date(value), "yyyy-MM-dd");
}

function toTimeInputValue(value: string) {
  return format(new Date(value), "HH:mm");
}

function buildInitialFormState(event: EventResponse["event"]): EventFormState {
  return {
    title: event.title,
    description: event.description ?? "",
    date: toDateInputValue(event.startDatetime),
    startTime: toTimeInputValue(event.startDatetime),
    endTime: toTimeInputValue(event.endDatetime),
    capacity: event.capacity ? String(event.capacity) : "",
    locationName: event.locationName ?? "",
    locationAddress: event.locationAddress ?? "",
    notes: event.notes ?? "",
    timezone: event.timezone ?? "America/New_York",
  };
}

function buildPayload(form: EventFormState) {
  const startDatetime = new Date(`${form.date}T${form.startTime}`);
  const endDatetime = new Date(`${form.date}T${form.endTime}`);

  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    startDatetime: startDatetime.toISOString(),
    endDatetime: endDatetime.toISOString(),
    locationName: form.locationName.trim() || undefined,
    locationAddress: form.locationAddress.trim() || undefined,
    capacity: form.capacity ? Number.parseInt(form.capacity, 10) : undefined,
    notes: form.notes.trim() || undefined,
    timezone: form.timezone.trim() || undefined,
  };
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params.id;

  const [eventData, setEventData] = useState<EventResponse | null>(null);
  const [form, setForm] = useState<EventFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error("Failed to load event");
        }

        const data = (await response.json()) as EventResponse;
        if (cancelled) {
          return;
        }

        setEventData(data);
        setForm(buildInitialFormState(data.event));
      } catch {
        if (!cancelled) {
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEvent();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const attendeeSummary = useMemo(() => {
    if (!eventData) {
      return { registered: 0, checkedIn: 0 };
    }

    return {
      registered: eventData.registrationCount,
      checkedIn: eventData.checkedInCount,
    };
  }, [eventData]);

  const updateField = (field: keyof EventFormState, value: string) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleSave = async () => {
    if (!form) {
      return;
    }

    if (!form.title.trim()) {
      toast.error("Please enter an event title.");
      return;
    }

    if (!form.date || !form.startTime || !form.endTime) {
      toast.error("Please complete the event date and time.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(form)),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(data?.error ?? "Failed to save event changes.");
        return;
      }

      setEventData((current) =>
        current
          ? {
              ...current,
              event: data.event,
            }
          : current
      );
      setForm(buildInitialFormState(data.event));
      toast.success("Event updated.");
    } catch {
      toast.error("Failed to save event changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!eventData) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/events/${eventId}/submit`, {
        method: "POST",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(data?.error ?? "Failed to submit event.");
        return;
      }

      setEventData((current) =>
        current
          ? {
              ...current,
              event: data.event,
            }
          : current
      );
      toast.success("Event submitted for approval.");
    } catch {
      toast.error("Failed to submit event.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!eventData) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${eventData.event.title}"? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(data?.error ?? "Failed to delete event.");
        return;
      }

      toast.success("Event deleted.");
      router.push("/drafts");
    } catch {
      toast.error("Failed to delete event.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Event Details"
          breadcrumbs={[
            { label: "Events", href: "/events" },
            { label: "Loading..." },
          ]}
        />
        <div className="space-y-4 p-4 md:p-8">
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              <LoadingSkeleton variant="list-item" count={4} />
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (loadError || !eventData || !form) {
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
            icon={Calendar}
            title="Event not available"
            description="We couldn't load this event. It may have been deleted or you may no longer have access."
            action={{ label: "Back to Events", href: "/events", variant: "outline" }}
          />
        </div>
      </>
    );
  }

  const event = eventData.event;
  const isDraft = event.status === "draft";
  const isLive = event.status === "live";

  return (
    <>
      <PageHeader
        title={event.title}
        description="Review the event setup, attendee list, and operational status."
        breadcrumbs={[
          { label: "Events", href: "/events" },
          { label: event.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {isLive && (
              <Link
                href={`/check-in/${event.id}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <ClipboardCheck className="h-4 w-4" />
                Check-in
              </Link>
            )}
            {isDraft && (
              <Button
                onClick={handleSubmitForApproval}
                disabled={submitting}
                className="gap-2 bg-accent text-accent-foreground hover:bg-wfr-gold-hover"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 p-4 md:p-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                Event Configuration
                <StatusBadge status={event.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <section className="space-y-4">
                <h3 className="text-lg">Event Details</h3>
                <div className="space-y-2">
                  <Label className="text-base">Event Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(eventTarget) => updateField("title", eventTarget.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Description</Label>
                  <textarea
                    value={form.description}
                    onChange={(eventTarget) =>
                      updateField("description", eventTarget.target.value)
                    }
                    className="min-h-[120px] w-full resize-none rounded-lg border border-input bg-transparent px-4 py-3 text-base transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none"
                    placeholder="Brief description of the event..."
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg">Date & Time</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-base">Date</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(eventTarget) => updateField("date", eventTarget.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Capacity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.capacity}
                      onChange={(eventTarget) =>
                        updateField("capacity", eventTarget.target.value)
                      }
                      className="h-12 text-base"
                      placeholder="20"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-base">Start Time</Label>
                    <Input
                      type="time"
                      value={form.startTime}
                      onChange={(eventTarget) =>
                        updateField("startTime", eventTarget.target.value)
                      }
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">End Time</Label>
                    <Input
                      type="time"
                      value={form.endTime}
                      onChange={(eventTarget) =>
                        updateField("endTime", eventTarget.target.value)
                      }
                      className="h-12 text-base"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg">Location</h3>
                <div className="space-y-2">
                  <Label className="text-base">Venue Name</Label>
                  <Input
                    value={form.locationName}
                    onChange={(eventTarget) =>
                      updateField("locationName", eventTarget.target.value)
                    }
                    className="h-12 text-base"
                    placeholder="Workshop venue"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Address</Label>
                  <Input
                    value={form.locationAddress}
                    onChange={(eventTarget) =>
                      updateField("locationAddress", eventTarget.target.value)
                    }
                    className="h-12 text-base"
                    placeholder="123 Main St, City, State"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg">Internal Notes</h3>
                <div className="space-y-2">
                  <Label className="text-base">Notes</Label>
                  <textarea
                    value={form.notes}
                    onChange={(eventTarget) => updateField("notes", eventTarget.target.value)}
                    className="min-h-[120px] w-full resize-none rounded-lg border border-input bg-transparent px-4 py-3 text-base transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none"
                    placeholder="Anything the team should remember on event day..."
                  />
                </div>
              </section>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Attendees
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {eventData.attendees.length === 0 ? (
                <p className="px-6 py-6 text-sm text-muted-foreground">
                  No attendees are registered for this event yet.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {eventData.attendees.map((attendee) => (
                    <div
                      key={attendee.registrationId}
                      className="flex items-center justify-between gap-4 px-6 py-4"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {attendee.firstName} {attendee.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {attendee.email ?? attendee.phone ?? "No contact details"}
                        </p>
                      </div>
                      <StatusBadge
                        status={
                          attendee.status === "registered"
                            ? "scheduled"
                            : attendee.status === "checked_in"
                              ? "live"
                              : "cancelled"
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Operational Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="rounded-2xl bg-wfr-bg-cool p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Event Status
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <StatusBadge status={event.status} />
                  <span className="text-sm text-muted-foreground">
                    Updated {format(new Date(event.startDatetime), "MMM d")}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <SummaryRow
                  icon={Calendar}
                  label="Date"
                  value={format(new Date(event.startDatetime), "EEEE, MMM d, yyyy")}
                />
                <SummaryRow
                  icon={Clock}
                  label="Time"
                  value={`${format(new Date(event.startDatetime), "h:mm a")} - ${format(new Date(event.endDatetime), "h:mm a")}`}
                />
                <SummaryRow
                  icon={MapPin}
                  label="Location"
                  value={event.locationName ?? "Not set"}
                />
                <SummaryRow
                  icon={Users}
                  label="Attendance"
                  value={`${attendeeSummary.checkedIn} checked in / ${attendeeSummary.registered} registered`}
                />
              </div>
            </CardContent>
          </Card>

          {isDraft && (
            <Card className="border-destructive/20">
              <CardHeader className="border-b">
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <p className="text-sm text-muted-foreground">
                  Drafts can be removed before they enter the approval workflow.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full gap-2"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete Draft
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
