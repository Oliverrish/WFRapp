"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  History,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  UserCheck,
  FileEdit,
  Trash2,
  Send,
  CheckSquare,
  X,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  metadata: string | null;
  createdAt: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  "event.created": <Calendar className="h-4 w-4" />,
  "event.updated": <FileEdit className="h-4 w-4" />,
  "event.deleted": <Trash2 className="h-4 w-4" />,
  "event.submitted": <Send className="h-4 w-4" />,
  "event.approved": <CheckSquare className="h-4 w-4" />,
  "event.rejected": <X className="h-4 w-4" />,
  "event.changes_requested": <MessageSquare className="h-4 w-4" />,
  "checkin.completed": <UserCheck className="h-4 w-4" />,
  "walkin.added": <UserPlus className="h-4 w-4" />,
};

const actionColors: Record<string, string> = {
  "event.created": "bg-wfr-bg-cool text-primary border-primary/20",
  "event.updated": "bg-wfr-warning-light text-wfr-warning border-wfr-warning/20",
  "event.deleted": "bg-destructive/10 text-destructive border-destructive/20",
  "event.submitted": "bg-wfr-bg-cool text-primary border-primary/20",
  "event.approved": "bg-wfr-success-light text-wfr-success border-wfr-success/20",
  "event.rejected": "bg-destructive/10 text-destructive border-destructive/20",
  "event.changes_requested": "bg-wfr-warning-light text-wfr-warning border-wfr-warning/20",
  "checkin.completed": "bg-wfr-success-light text-wfr-success border-wfr-success/20",
  "walkin.added": "bg-wfr-gold-light text-wfr-gold border-wfr-gold/20",
};

const entityTypes = [
  { value: "", label: "All types" },
  { value: "event", label: "Events" },
  { value: "registration", label: "Check-ins" },
  { value: "lead", label: "Leads" },
];

const PAGE_SIZE = 30;

export default function ChangeLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(page * PAGE_SIZE));
    if (search) params.set("search", search);
    if (entityType) params.set("entityType", entityType);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);

    try {
      const res = await fetch(`/api/activity-log?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs ?? []);
        setTotal(data.total ?? 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, search, entityType, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasActiveFilters = entityType || dateFrom || dateTo;

  return (
    <>
      <AdminPageHeader
        title="Change Log"
        description="Every action across the platform, tracked and filterable"
      />
      <div className="p-4 md:p-8 space-y-4">
        {/* Search + Filter toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search activity..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn("gap-2 h-10 shrink-0", hasActiveFilters && "border-primary text-primary")}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                {[entityType, dateFrom, dateTo].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <Card className="animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Type</label>
                  <select
                    value={entityType}
                    onChange={(e) => { setEntityType(e.target.value); setPage(0); }}
                    className="w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none"
                  >
                    {entityTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">From</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">To</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                    className="h-10"
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-muted-foreground"
                  onClick={() => { setEntityType(""); setDateFrom(""); setDateTo(""); setPage(0); }}
                >
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted-foreground">
            {total === 0 ? "No activity found" : `${total} ${total === 1 ? "entry" : "entries"}`}
            {hasActiveFilters && " (filtered)"}
          </p>
        )}

        {/* Activity list */}
        {loading ? (
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              <LoadingSkeleton variant="list-item" count={8} />
            </CardContent>
          </Card>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={History}
            title="No activity yet"
            description="Actions like creating events, checking in attendees, and approving submissions will appear here."
          />
        ) : (
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {logs.map((log) => (
                <LogRow key={log.id} log={log} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function LogRow({ log }: { log: LogEntry }) {
  const icon = actionIcons[log.action] ?? <History className="h-4 w-4" />;
  const colorClass = actionColors[log.action] ?? "bg-muted text-muted-foreground border-border";
  const actionLabel = log.action.split(".").pop()?.replace(/_/g, " ") ?? log.action;
  const initials = log.actorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const metadata = log.metadata ? JSON.parse(log.metadata) : null;
  const timeAgo = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true });
  const fullDate = format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a");

  return (
    <div className="flex items-start gap-3 px-4 md:px-6 py-4 hover:bg-secondary/30 transition-colors">
      {/* Action icon */}
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border mt-0.5", colorClass)}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-relaxed">
          {log.description}
        </p>
        {metadata?.comment && (
          <p className="mt-1 text-xs text-muted-foreground italic border-l-2 border-border pl-2">
            &ldquo;{metadata.comment}&rdquo;
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[9px] bg-secondary text-muted-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-foreground">{log.actorName}</span>
          </div>
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", colorClass)}>
            {actionLabel}
          </Badge>
          <span className="text-xs text-muted-foreground" title={fullDate}>
            {timeAgo}
          </span>
        </div>
      </div>

      {/* Entity type badge */}
      <Badge variant="outline" className="hidden sm:inline-flex text-xs text-muted-foreground border-border shrink-0">
        {log.entityType}
      </Badge>
    </div>
  );
}
