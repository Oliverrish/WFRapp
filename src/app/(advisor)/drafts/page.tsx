"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus, MapPin, Calendar, Send, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface DraftEvent {
  id: string;
  title: string;
  status: string;
  locationName: string | null;
  startDatetime: string;
  endDatetime: string;
  capacity: number | null;
  registrationCount: number;
  checkedInCount: number;
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDrafts = () => {
    setLoading(true);
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        const allEvents: DraftEvent[] = data.events ?? [];
        setDrafts(allEvents.filter((e) => e.status === "draft"));
      })
      .catch(() => {
        toast.error("Failed to load drafts");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleSubmit = async (id: string) => {
    setSubmitting(id);
    try {
      const res = await fetch(`/api/events/${id}/submit`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to submit event");
        return;
      }
      toast.success("Event submitted for approval");
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch {
      toast.error("Failed to submit event");
    } finally {
      setSubmitting(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    setDeleting(id);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete event");
        return;
      }
      toast.success("Draft deleted");
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Drafts"
        description="Events you're still working on"
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
        {loading ? (
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              <LoadingSkeleton variant="list-item" count={4} />
            </CardContent>
          </Card>
        ) : drafts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No drafts"
            description="You don't have any draft events. Create a new event to get started."
            action={{ label: "Start New Event", href: "/events/new", variant: "accent" }}
          />
        ) : (
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {drafts.map((draft) => {
                const start = new Date(draft.startDatetime);
                return (
                  <div
                    key={draft.id}
                    className="flex items-center gap-4 px-4 md:px-6 py-4"
                  >
                    {/* Date tile */}
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <span className="text-xs font-medium uppercase leading-none">
                        {format(start, "MMM")}
                      </span>
                      <span className="text-xl font-bold leading-tight">
                        {format(start, "d")}
                      </span>
                    </div>

                    {/* Event info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-foreground truncate">
                        {draft.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(start, "MMM d, yyyy")}
                        </span>
                        {draft.locationName && (
                          <span className="flex items-center gap-1.5 truncate">
                            <MapPin className="h-3.5 w-3.5" />
                            {draft.locationName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/events/${draft.id}`}
                        className={`${buttonVariants({ variant: "outline", size: "sm" })} hidden sm:inline-flex`}
                      >
                        Edit
                      </Link>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-wfr-navy-light gap-1.5"
                        onClick={() => handleSubmit(draft.id)}
                        disabled={submitting === draft.id}
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">
                          {submitting === draft.id ? "Submitting..." : "Submit"}
                        </span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => handleDelete(draft.id, draft.title)}
                        disabled={deleting === draft.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
