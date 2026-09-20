export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gradient-to-br from-gray-200 to-gray-100 ${className}`}
    />
  );
}

export function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">
      <div className="relative overflow-hidden rounded-2xl p-8 sm:p-12 bg-navy">
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <Skeleton className="h-6 w-28 mx-auto rounded-full bg-white/15" />
          <Skeleton className="h-10 w-3/4 mx-auto rounded-xl bg-white/10" />
          <Skeleton className="h-4 w-1/2 mx-auto bg-white/8" />
          <Skeleton className="h-3 w-1/4 mx-auto bg-white/6" />
        </div>
      </div>
      <div className="w-full aspect-[16/9] max-w-5xl mx-auto rounded-2xl overflow-hidden border border-border">
        <Skeleton className="w-full h-full bg-navy/[0.03]" />
      </div>
      <div className="space-y-4 pt-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-40 rounded-lg" />
          <Skeleton className="h-5 w-24 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-[3/4] rounded-lg" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      <header className="space-y-3 pb-6 border-b border-border">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-9 w-2/3 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </header>
      <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-border">
        <Skeleton className="w-full h-full bg-navy/[0.03]" />
      </div>
    </div>
  );
}
