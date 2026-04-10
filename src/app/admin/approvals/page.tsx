"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckSquare, Check, X, MessageSquare, MapPin, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { EventStatus } from "@/types";

interface PendingEvent {
  id: string;
  title: string;
  status: EventStatus;
  locationName: string | null;
  startDatetime: string;
  endDatetime: string;
  capacity: number | null;
  registrationCount: number;
}

export default function ApprovalsPage() {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [changesComment, setChangesComment] = useState("");

  const loadEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(
          (data.events ?? []).filter(
            (e: PendingEvent) => e.status === "pending_approval"
          )
        );
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const handleAction = async (
    eventId: string,
    action: "approved" | "rejected" | "changes_requested",
    comment?: string
  ) => {
    setActionLoading(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment }),
      });
      if (res.ok) {
        toast.success(
          action === "approved"
            ? "Event approved and scheduled"
            : action === "rejected"
              ? "Event rejected"
              : "Changes requested"
        );
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      } else {
        toast.error("Failed to process approval");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Event Approvals"
        description="Review and approve advisor event submissions"
      />
      <div className="p-4 md:p-8">
        {loading ? (
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              <LoadingSkeleton variant="list-item" count={3} />
            </CardContent>
          </Card>
        ) : events.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="All clear"
            description="No events pending approval right now."
          />
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {event.title}
                        </h3>
                        <StatusBadge status="pending_approval" />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(event.startDatetime), "MMM d, yyyy")} &middot;{" "}
                          {format(new Date(event.startDatetime), "h:mm a")}
                        </span>
                        {event.locationName && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.locationName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Approve */}
                      <Button
                        size="sm"
                        className="bg-wfr-success hover:bg-wfr-success/90 text-white gap-1.5"
                        onClick={() => handleAction(event.id, "approved")}
                        disabled={actionLoading === event.id}
                      >
                        {actionLoading === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Approve
                      </Button>

                      {/* Request Changes */}
                      <Dialog>
                        <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          <span className="hidden sm:inline">Changes</span>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Changes</DialogTitle>
                            <DialogDescription>
                              Tell the advisor what needs to be updated before approval.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-2">
                            <Label>Comment</Label>
                            <textarea
                              value={changesComment}
                              onChange={(e) => setChangesComment(e.target.value)}
                              placeholder="Please update the venue details..."
                              className="mt-2 w-full rounded-lg border border-input bg-transparent px-4 py-3 text-base transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none min-h-[100px] resize-none"
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                              Cancel
                            </DialogClose>
                            <Button
                              onClick={() => {
                                handleAction(event.id, "changes_requested", changesComment);
                                setChangesComment("");
                              }}
                              className="bg-wfr-warning text-white hover:bg-wfr-warning/90"
                            >
                              Send Feedback
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Reject */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
                        onClick={() => handleAction(event.id, "rejected", "Event rejected by admin.")}
                        disabled={actionLoading === event.id}
                      >
                        <X className="h-4 w-4" />
                        <span className="hidden sm:inline">Reject</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
