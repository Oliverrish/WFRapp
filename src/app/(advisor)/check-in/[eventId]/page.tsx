"use client";

import { useState } from "react";
import Link from "next/link";
import { useSidebar } from "@/components/shared/sidebar-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, ArrowLeft, Check, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Attendee {
  name: string;
  phone: string;
  checked: boolean;
}

const mockAttendees: Attendee[] = [
  { name: "John Smith", phone: "(555) 123-4567", checked: true },
  { name: "Mary Johnson", phone: "(555) 234-5678", checked: true },
  { name: "Robert Williams", phone: "(555) 345-6789", checked: true },
  { name: "Patricia Brown", phone: "(555) 456-7890", checked: true },
  { name: "James Davis", phone: "(555) 567-8901", checked: false },
  { name: "Linda Miller", phone: "(555) 678-9012", checked: false },
  { name: "Michael Wilson", phone: "(555) 789-0123", checked: false },
  { name: "Elizabeth Moore", phone: "(555) 890-1234", checked: false },
];

export default function CheckInPage() {
  const { isMobile } = useSidebar();
  const [attendees, setAttendees] = useState(mockAttendees);
  const [search, setSearch] = useState("");

  const checkedIn = attendees.filter((a) => a.checked).length;
  const total = attendees.length;
  const percentage = Math.round((checkedIn / total) * 100);

  const filtered = search
    ? attendees.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.phone.includes(search)
      )
    : attendees;

  const handleCheckIn = (index: number) => {
    setAttendees((prev) =>
      prev.map((a, i) => (i === index ? { ...a, checked: !a.checked } : a))
    );
  };

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
                Retirement Planning Workshop
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                Apr 15 &middot; 6:00 - 7:00 PM &middot; Scotch & Sirloin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Sync indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-wfr-success" />
              <span>Synced</span>
            </div>

            {/* Counter pill */}
            <div className="flex items-center gap-2 rounded-xl bg-primary px-3 md:px-4 py-2 text-primary-foreground">
              <span className="text-xl md:text-2xl font-bold leading-none">{checkedIn}/{total}</span>
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
          <Button className="h-12 md:h-11 gap-2 bg-accent text-accent-foreground hover:bg-wfr-gold-hover font-semibold text-base md:text-sm shrink-0">
            <UserPlus className="h-5 w-5" />
            Walk-in
          </Button>
        </div>
      </div>

      {/* Attendee list */}
      <div className="flex-1 px-3 md:px-8 pb-20 md:pb-8">
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {filtered.map((attendee, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between px-4 md:px-6 py-3 md:py-4 transition-colors",
                  attendee.checked && "bg-wfr-success-light/30"
                )}
              >
                <div className="min-w-0">
                  <p className="text-base font-medium text-foreground">{attendee.name}</p>
                  <p className="text-sm text-muted-foreground">{attendee.phone}</p>
                </div>
                <Button
                  onClick={() => handleCheckIn(i)}
                  variant={attendee.checked ? "default" : "outline"}
                  className={cn(
                    "h-11 md:h-10 w-28 md:w-24 text-sm font-semibold transition-all shrink-0",
                    attendee.checked
                      ? "bg-wfr-success hover:bg-wfr-success/90 text-white border-wfr-success"
                      : "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
                    "active:scale-95"
                  )}
                >
                  {attendee.checked ? (
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

            {filtered.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No attendees match &ldquo;{search}&rdquo;
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
