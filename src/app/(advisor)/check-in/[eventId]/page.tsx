"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSidebar } from "@/components/shared/sidebar-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
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
import {
  Search,
  UserPlus,
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Registration {
  id: string;
  status: "registered" | "checked_in" | "no_show";
  checkedInAt: string | null;
  lead: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  };
}

interface EventData {
  id: string;
  title: string;
  status: string;
  locationName: string | null;
  startDatetime: string;
  endDatetime: string;
  capacity: number | null;
}

export default function CheckInPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { isMobile } = useSidebar();

  const [event, setEvent] = useState<EventData | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInData, setWalkInData] = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [walkInLoading, setWalkInLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [eventRes, regRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/registrations`),
      ]);
      if (eventRes.ok) {
        const eventData = await eventRes.json();
        setEvent(eventData.event);
      }
      if (regRes.ok) {
        const regData = await regRes.json();
        setRegistrations(regData.registrations ?? []);
      }
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const checkedIn = registrations.filter((r) => r.status === "checked_in").length;
  const total = registrations.length;
  const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  const filtered = search
    ? registrations.filter((r) => {
        const name = `${r.lead.firstName} ${r.lead.lastName}`.toLowerCase();
        const q = search.toLowerCase();
        return (
          name.includes(q) ||
          (r.lead.email?.toLowerCase().includes(q) ?? false) ||
          (r.lead.phone?.includes(search) ?? false)
        );
      })
    : registrations;

  // Sort: not checked in first, then checked in
  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "checked_in" && b.status !== "checked_in") return 1;
    if (a.status !== "checked_in" && b.status === "checked_in") return -1;
    return 0;
  });

  const handleCheckIn = async (registrationId: string) => {
    setCheckingIn(registrationId);
    try {
      const res = await fetch(`/api/events/${eventId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });
      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === registrationId
              ? { ...r, status: "checked_in", checkedInAt: new Date().toISOString() }
              : r
          )
        );
      }
    } catch {
      // Handle error silently
    } finally {
      setCheckingIn(null);
    }
  };

  const handleWalkIn = async () => {
    if (!walkInData.firstName || !walkInData.lastName) return;
    setWalkInLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/walk-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walkInData),
      });
      if (res.ok) {
        setWalkInData({ firstName: "", lastName: "", phone: "", email: "" });
        setWalkInOpen(false);
        await loadData(); // Refresh full list
      }
    } catch {
      // Handle error
    } finally {
      setWalkInLoading(false);
    }
  };

  const eventTitle = event?.title ?? "Loading...";
  const eventSubline = event
    ? `${format(new Date(event.startDatetime), "MMM d")} · ${format(new Date(event.startDatetime), "h:mm a")} - ${format(new Date(event.endDatetime), "h:mm a")}${event.locationName ? ` · ${event.locationName}` : ""}`
    : "";

  return (
    <div className={cn("flex flex-col", isMobile ? "h-screen" : "")}>
      {/* Header bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-border px-3 md:px-8 py-3 md:py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/events"
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg hover:bg-secondary transition-colors shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-semibold text-foreground truncate">
                {eventTitle}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {eventSubline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-wfr-success" />
              <span>Synced</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-primary px-3 md:px-4 py-2 text-primary-foreground">
              <span className="text-xl md:text-2xl font-bold leading-none">
                {checkedIn}/{total}
              </span>
              <div className="hidden sm:block text-xs leading-tight opacity-80">
                <div>checked</div>
                <div>in ({percentage}%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Walk-in */}
      <div className="sticky top-[73px] md:top-[81px] z-10 bg-wfr-bg-warm px-3 md:px-8 py-3 md:py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 md:h-11 pl-11 text-base"
            />
          </div>
          <Dialog open={walkInOpen} onOpenChange={setWalkInOpen}>
            <DialogTrigger
              className="h-12 md:h-11 inline-flex items-center gap-2 rounded-lg px-4 bg-accent text-accent-foreground hover:bg-wfr-gold-hover font-semibold text-base md:text-sm shrink-0 transition-colors"
            >
              <UserPlus className="h-5 w-5" />
              Walk-in
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Walk-in</DialogTitle>
                <DialogDescription>
                  Quick-add an attendee who wasn&apos;t pre-registered.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input
                      value={walkInData.firstName}
                      onChange={(e) => setWalkInData((d) => ({ ...d, firstName: e.target.value }))}
                      placeholder="John"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input
                      value={walkInData.lastName}
                      onChange={(e) => setWalkInData((d) => ({ ...d, lastName: e.target.value }))}
                      placeholder="Smith"
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={walkInData.phone}
                    onChange={(e) => setWalkInData((d) => ({ ...d, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={walkInData.email}
                    onChange={(e) => setWalkInData((d) => ({ ...d, email: e.target.value }))}
                    placeholder="john@example.com"
                    className="h-11"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                  Cancel
                </DialogClose>
                <Button
                  onClick={handleWalkIn}
                  disabled={walkInLoading || !walkInData.firstName || !walkInData.lastName}
                  className="bg-primary hover:bg-wfr-navy-light"
                >
                  {walkInLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Check in
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Attendee list */}
      <div className="flex-1 px-3 md:px-8 pb-20 md:pb-8">
        {loading ? (
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              <LoadingSkeleton variant="list-item" count={6} />
            </CardContent>
          </Card>
        ) : sorted.length === 0 && !search ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-lg font-medium text-foreground">No attendees registered</p>
              <p className="mt-1 text-muted-foreground">Add walk-in attendees as they arrive.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {sorted.map((reg) => (
                <div
                  key={reg.id}
                  className={cn(
                    "flex items-center justify-between px-4 md:px-6 py-3 md:py-4 transition-colors",
                    reg.status === "checked_in" && "bg-wfr-success-light/30"
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-base font-medium text-foreground">
                      {reg.lead.firstName} {reg.lead.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reg.lead.phone || reg.lead.email || "No contact info"}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleCheckIn(reg.id)}
                    disabled={reg.status === "checked_in" || checkingIn === reg.id}
                    variant={reg.status === "checked_in" ? "default" : "outline"}
                    className={cn(
                      "h-11 md:h-10 w-28 md:w-24 text-sm font-semibold transition-all shrink-0",
                      reg.status === "checked_in"
                        ? "bg-wfr-success hover:bg-wfr-success/90 text-white border-wfr-success"
                        : "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
                      "active:scale-95"
                    )}
                  >
                    {checkingIn === reg.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : reg.status === "checked_in" ? (
                      <span className="flex items-center gap-1.5">
                        <Check className="h-4 w-4" />
                        Checked in
                      </span>
                    ) : (
                      "Check in"
                    )}
                  </Button>
                </div>
              ))}

              {filtered.length === 0 && search && (
                <div className="py-12 text-center text-muted-foreground">
                  No attendees match &ldquo;{search}&rdquo;
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
