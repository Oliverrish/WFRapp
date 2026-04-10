"use client";

import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";

interface LeadData {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  eventCount: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => setLeads(data.leads ?? []))
      .catch(() => {
        toast.error("Failed to load leads");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase().trim();
    return leads.filter((lead) => {
      const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
      const email = (lead.email ?? "").toLowerCase();
      const phone = (lead.phone ?? "").toLowerCase();
      return fullName.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [leads, search]);

  return (
    <>
      <PageHeader
        title="Leads"
        description="All your event attendees"
      />
      <div className="p-4 md:p-8 space-y-4">
        {/* Search */}
        {!loading && leads.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              <LoadingSkeleton variant="list-item" count={6} />
            </CardContent>
          </Card>
        ) : leads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No leads yet"
            description="Your event attendees will appear here as leads. Create an event and start collecting registrations."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No results"
            description={`No leads match "${search}". Try a different search term.`}
            action={{ label: "Clear Search", onClick: () => setSearch(""), variant: "outline" }}
          />
        ) : (
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {filtered.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center gap-4 px-4 md:px-6 py-4 hover:bg-secondary/50 transition-colors cursor-default"
                >
                  {/* Avatar circle with initials */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {lead.firstName.charAt(0).toUpperCase()}
                    {lead.lastName.charAt(0).toUpperCase()}
                  </div>

                  {/* Lead info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-foreground truncate">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-0.5">
                      {lead.email && (
                        <span className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {lead.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Event count badge */}
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {lead.eventCount} {lead.eventCount === 1 ? "event" : "events"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
