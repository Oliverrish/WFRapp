"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewEventPage() {
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
            <form className="space-y-8">
              {/* Event Details */}
              <section className="space-y-4">
                <h4 className="text-lg">Event Details</h4>
                <div className="space-y-2">
                  <Label className="text-base">Event Title</Label>
                  <Input
                    placeholder="Retirement Planning Workshop"
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Description</Label>
                  <textarea
                    placeholder="Brief description of the event..."
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
                    <Input type="date" className="h-12 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Capacity</Label>
                    <Input
                      type="number"
                      placeholder="20"
                      className="h-12 text-base"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base">Start Time</Label>
                    <Input type="time" className="h-12 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">End Time</Label>
                    <Input type="time" className="h-12 text-base" />
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
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Address</Label>
                  <Input
                    placeholder="123 Main St, City, State"
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
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  className="h-12 px-6 text-base font-semibold bg-primary hover:bg-wfr-navy-light"
                >
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
