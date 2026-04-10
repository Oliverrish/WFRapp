import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types";

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
  },
  pending_approval: {
    label: "Pending",
    className: "bg-wfr-warning-light text-wfr-warning border-wfr-warning/20",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-wfr-bg-cool text-primary border-primary/20",
  },
  live: {
    label: "Live",
    className: "bg-wfr-success-light text-wfr-success border-wfr-success/20",
  },
  completed: {
    label: "Completed",
    className: "bg-secondary text-muted-foreground border-border",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function StatusBadge({ status }: { status: EventStatus }) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium text-xs px-2.5 py-0.5",
        config.className
      )}
    >
      {status === "live" && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-wfr-success opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-wfr-success" />
        </span>
      )}
      {config.label}
    </Badge>
  );
}
