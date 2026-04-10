"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    capacity: "",
    locationName: "",
    locationAddress: "",
    notes: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const buildPayload = (status: "draft" | "pending_approval") => {
    const startDatetime = form.date && form.startTime
      ? new Date(`${form.date}T${form.startTime}`).toISOString()
      : new Date().toISOString();
    const endDatetime = form.date && form.endTime
      ? new Date(`${form.date}T${form.endTime}`).toISOString()
      : new Date(Date.now() + 90 * 60000).toISOString();

    return {
      title: form.title,
      description: form.description || undefined,
      startDatetime,
      endDatetime,
      locationName: form.locationName || undefined,
      locationAddress: form.locationAddress || undefined,
      capacity: form.capacity ? parseInt(form.capacity) : undefined,
      notes: form.notes || undefined,
      status,
    };
  };

  const handleSubmit = async (status: "draft" | "pending_approval") => {
    if (!form.title.trim()) {
      toast.error("Please enter an event title");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(status)),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create event");
        return;
      }
      toast.success(
        status === "draft"
          ? "Event saved as draft"
          : "Event submitted for approval"
      );
      router.push(status === "draft" ? "/drafts" : "/events");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Add Event"
        breadcrumbs={[
          { label: "Events", href: "/events" },
          { label: "New Event" },
        ]}
      />
      <div className="p-4 md:p-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
        <Card className="max-w-2xl shadow-sm">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit("pending_approval"); }} className="space-y-8">
              {/* Event Details */}
              <section className="space-y-4">
                <h4 className="text-lg">Event Details</h4>
                <div className="space-y-2">
                  <Label className="text-base">Event Title *</Label>
                  <Input
                    placeholder="Retirement Planning Workshop"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    className="h-12 text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Description</Label>
                  <textarea
                    placeholder="Brief description of the event..."
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    className="w-full rounded-lg border border-input bg-transparent px-4 py-3 text-base transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none min-h-[100px] resize-none"
                  />
                </div>
              </section>

              {/* Date & Time */}
              <section className="space-y-4">
                <h4 className="text-lg">Date & Time</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base">Date</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => update("date", e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Capacity</Label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={form.capacity}
                      onChange={(e) => update("capacity", e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base">Start Time</Label>
                    <Input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => update("startTime", e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">End Time</Label>
                    <Input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => update("endTime", e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                </div>
              </section>

              {/* Location */}
              <section className="space-y-4">
                <h4 className="text-lg">Location</h4>
                <div className="space-y-2">
                  <Label className="text-base">Venue Name</Label>
                  <Input
                    placeholder="Scotch & Sirloin Restaurant"
                    value={form.locationName}
                    onChange={(e) => update("locationName", e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Address</Label>
                  <Input
                    placeholder="123 Main St, City, State"
                    value={form.locationAddress}
                    onChange={(e) => update("locationAddress", e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
              </section>

              {/* Notes */}
              <section className="space-y-4">
                <h4 className="text-lg">Notes</h4>
                <div className="space-y-2">
                  <Label className="text-base">Internal Notes</Label>
                  <textarea
                    placeholder="Notes visible only to you..."
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    className="w-full rounded-lg border border-input bg-transparent px-4 py-3 text-base transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none min-h-[80px] resize-none"
                  />
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-6 text-base border-primary text-primary"
                  onClick={() => handleSubmit("draft")}
                  disabled={loading}
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  className="h-12 px-6 text-base font-semibold bg-primary hover:bg-wfr-navy-light"
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Submit for Approval
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
