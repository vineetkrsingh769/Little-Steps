export function CenterSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-card animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="space-y-3 p-5">
        <div className="flex justify-between items-center">
          <div className="h-5 w-3/5 rounded-lg bg-muted" />
          <div className="h-4 w-12 rounded-lg bg-muted" />
        </div>
        <div className="h-4 w-2/5 rounded-lg bg-muted" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-muted" />
          <div className="h-6 w-16 rounded-full bg-muted" />
        </div>
        <div className="h-6 w-24 rounded-lg bg-muted pt-1" />
      </div>
    </div>
  );
}

export function CenterSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CenterSkeleton key={i} />
      ))}
    </div>
  );
}
