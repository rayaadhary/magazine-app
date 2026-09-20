export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-[#e5e7eb] ${className}`}
    />
  );
}

export function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">
      <div className="relative overflow-hidden p-8 sm:p-12 bg-[#0A0A0A]">
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <Skeleton className="h-6 w-28 mx-auto bg-white/15" />
          <Skeleton className="h-10 w-3/4 mx-auto bg-white/10" />
          <Skeleton className="h-4 w-1/2 mx-auto bg-white/8" />
          <Skeleton className="h-3 w-1/4 mx-auto bg-white/6" />
        </div>
      </div>
      <div className="w-full aspect-[16/9] max-w-5xl mx-auto overflow-hidden border border-border">
        <Skeleton className="w-full h-full bg-navy/[0.03]" />
      </div>
      <div className="space-y-4 pt-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-[3/4]" />
              <Skeleton className="h-4 w-5/6" />
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
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </header>
      <div className="w-full aspect-[16/9] overflow-hidden border border-border">
        <Skeleton className="w-full h-full bg-navy/[0.03]" />
      </div>
    </div>
  );
}
