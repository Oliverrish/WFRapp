"use client";

import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Wifi, WifiOff } from "lucide-react";

export default function CheckInPage() {
  return (
    <>
      <Header title="Check-in" />
      <div className="p-8">
        {/* Status bar */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1a1a2e]">
              Retirement Planning Workshop
            </h2>
            <p className="text-base text-[#64748b]">
              Apr 15, 2026 &middot; 6:00 - 7:00 PM &middot; Scotch & Sirloin
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-[#64748b]">Synced</span>
            </div>
            <div className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-center">
              <p className="text-2xl font-bold text-white">4/6</p>
              <p className="text-xs text-white/70">checked in</p>
            </div>
          </div>
        </div>

        {/* Search + Walk-in */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748b]" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="h-12 pl-11 text-base"
            />
          </div>
          <Button className="h-12 gap-2 bg-[#d4a441] text-[#1e3a5f] hover:bg-[#c49535] font-semibold">
            <UserPlus className="h-5 w-5" />
            Walk-in
          </Button>
        </div>

        {/* Attendee list */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {[
                { name: "John Smith", phone: "(555) 123-4567", checked: true },
                { name: "Mary Johnson", phone: "(555) 234-5678", checked: true },
                { name: "Robert Williams", phone: "(555) 345-6789", checked: true },
                { name: "Patricia Brown", phone: "(555) 456-7890", checked: true },
                { name: "James Davis", phone: "(555) 567-8901", checked: false },
                { name: "Linda Miller", phone: "(555) 678-9012", checked: false },
              ].map((attendee, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="text-base font-medium text-[#1a1a2e]">
                      {attendee.name}
                    </p>
                    <p className="text-sm text-[#64748b]">{attendee.phone}</p>
                  </div>
                  <Button
                    variant={attendee.checked ? "default" : "outline"}
                    size="sm"
                    className={
                      attendee.checked
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"
                    }
                  >
                    {attendee.checked ? "Checked in" : "Check in"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
