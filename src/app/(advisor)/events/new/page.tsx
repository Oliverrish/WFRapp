"use client";

import { Header } from "@/components/shared/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewEventPage() {
  return (
    <>
      <Header title="Add Event" />
      <div className="p-8">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-[#1a1a2e]">
              Create New Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base">Event Title</Label>
                <Input
                  placeholder="Retirement Planning Workshop"
                  className="h-12 text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base">Start Time</Label>
                  <Input type="time" className="h-12 text-base" />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">End Time</Label>
                  <Input type="time" className="h-12 text-base" />
                </div>
              </div>

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

              <div className="space-y-2">
                <Label className="text-base">Description</Label>
                <textarea
                  placeholder="Brief description of the event..."
                  className="w-full rounded-lg border border-[#e5e5e5] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">Internal Notes</Label>
                <textarea
                  placeholder="Notes visible only to you..."
                  className="w-full rounded-lg border border-[#e5e5e5] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 min-h-[80px] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-6 text-base"
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  className="h-12 px-6 text-base bg-[#1e3a5f] hover:bg-[#2d4a6f]"
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
