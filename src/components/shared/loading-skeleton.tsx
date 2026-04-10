import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return <div className={cn("bg-muted animate-pulse rounded", className)} />;
}

interface LoadingSkeletonProps {
  variant: "card" | "table-row" | "stat" | "list-item";
  count?: number;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <Bone className="h-5 w-3/5" />
      <Bone className="h-4 w-4/5" />
      <Bone className="h-4 w-2/5" />
      <div className="flex gap-2 pt-2">
        <Bone className="h-8 w-20 rounded-lg" />
        <Bone className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0">
      <Bone className="h-10 w-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Bone className="h-4 w-2/5" />
        <Bone className="h-3 w-1/3" />
      </div>
      <Bone className="h-6 w-20 rounded-full" />
    </div>
  );
}

function SkeletonStat() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          <Bone className="h-4 w-24" />
          <Bone className="h-8 w-16" />
          <Bone className="h-3 w-32" />
        </div>
        <Bone className="h-12 w-12 rounded-xl" />
      </div>
    </div>
  );
}

function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 px-4 md:px-6 py-4 border-b border-border last:border-0">
      <Bone className="h-12 w-12 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Bone className="h-4 w-3/5" />
        <Bone className="h-3 w-2/5" />
      </div>
      <Bone className="h-9 w-24 rounded-lg" />
    </div>
  );
}

const variants = {
  card: SkeletonCard,
  "table-row": SkeletonTableRow,
  stat: SkeletonStat,
  "list-item": SkeletonListItem,
};

export function LoadingSkeleton({ variant, count = 1 }: LoadingSkeletonProps) {
  const Component = variants[variant];
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </>
  );
}
