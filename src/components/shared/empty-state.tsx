import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "accent";
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 md:py-20 text-center px-6">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 max-w-sm text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
        {action && action.href ? (
          <Link href={action.href}>
            <Button
              className={cn(
                "mt-6 h-11 px-6 text-base font-semibold",
                action.variant === "accent"
                  ? "bg-accent text-accent-foreground hover:bg-wfr-gold-hover"
                  : action.variant === "outline"
                    ? "border-primary text-primary"
                    : "bg-primary text-primary-foreground hover:bg-wfr-navy-light"
              )}
              variant={action.variant === "outline" ? "outline" : "default"}
            >
              {action.label}
            </Button>
          </Link>
        ) : action ? (
          <Button
            className={cn(
              "mt-6 h-11 px-6 text-base font-semibold",
              action.variant === "accent"
                ? "bg-accent text-accent-foreground hover:bg-wfr-gold-hover"
                : action.variant === "outline"
                  ? "border-primary text-primary"
                  : "bg-primary text-primary-foreground hover:bg-wfr-navy-light"
            )}
            variant={action.variant === "outline" ? "outline" : "default"}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
