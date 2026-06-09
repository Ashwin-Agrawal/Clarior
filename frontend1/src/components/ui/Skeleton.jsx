function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Skeleton({ className = "" }) {
  return (
    <div
      className={cx(
        "animate-pulse rounded-xl bg-surface-2 border border-border/50 bg-muted/10",
        className
      )}
    />
  );
}

export function MentorCardSkeleton() {
  return (
    <div className="rounded-[32px] border border-border bg-surface p-6 animate-pulse space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-muted/25" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 bg-muted/25 rounded-full" />
          <div className="h-3 w-1/2 bg-muted/25 rounded-full" />
        </div>
        <div className="h-5 w-12 bg-muted/25 rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-muted/25 rounded-full" />
        <div className="h-5 w-20 bg-muted/25 rounded-full" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full bg-muted/25 rounded-full" />
        <div className="h-3 w-[80%] bg-muted/25 rounded-full" />
      </div>
      <div className="h-11 w-full bg-muted/25 rounded-2xl mt-4" />
    </div>
  );
}

export function SessionCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-1/4 bg-muted/25 rounded-full" />
        <div className="h-5 w-16 bg-muted/25 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="h-10 bg-muted/25 rounded-xl" />
        <div className="h-10 bg-muted/25 rounded-xl" />
      </div>
      <div className="h-10 w-full bg-muted/25 rounded-2xl" />
    </div>
  );
}

export function SlotCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-surface p-5 animate-pulse space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-2 w-1/4 bg-muted/25 rounded-full" />
          <div className="h-4 w-3/4 bg-muted/25 rounded-full" />
        </div>
        <div className="h-5 w-12 bg-muted/25 rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-3 w-16 bg-muted/25 rounded-full" />
        <div className="h-3 w-24 bg-muted/25 rounded-full" />
      </div>
    </div>
  );
}

Skeleton.MentorCard = MentorCardSkeleton;
Skeleton.Session = SessionCardSkeleton;
Skeleton.Slot = SlotCardSkeleton;

export default Skeleton;

