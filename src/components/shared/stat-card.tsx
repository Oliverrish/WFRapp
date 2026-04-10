import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  iconBg?: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendDirection = "neutral",
  iconBg = "bg-secondary",
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-12 w-12 bg-muted animate-pulse rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-bold text-foreground tracking-tight">
              {value}
            </p>
            {trend && (
              <div className="mt-1 flex items-center gap-1">
                {trendDirection === "up" && (
                  <TrendingUp className="h-3.5 w-3.5 text-wfr-success" />
                )}
                {trendDirection === "down" && (
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                )}
                <p
                  className={cn(
                    "text-xs font-medium",
                    trendDirection === "up" && "text-wfr-success",
                    trendDirection === "down" && "text-destructive",
                    trendDirection === "neutral" && "text-muted-foreground"
                  )}
                >
                  {trend}
                </p>
              </div>
            )}
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", iconBg)}>
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
