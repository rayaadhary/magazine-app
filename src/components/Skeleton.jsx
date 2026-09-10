export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700/60 rounded-lg ${className}`}
    />
  );
}

export function HomeSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 animate-fade-in">
      {/* Hero Skeleton */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <Skeleton className="h-9 w-3/4 mx-auto rounded-xl" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <Skeleton className="h-3 w-1/4 mx-auto" />
      </div>

      {/* Flipbook Viewer Container Skeleton */}
      <div className="w-full aspect-[16/10] sm:aspect-[16/9] max-w-5xl mx-auto rounded-2xl overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Grid Majalah Lainnya Skeleton */}
      <div className="space-y-4 pt-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full aspect-[3/4] rounded-xl" />
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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title & Desc Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Flipbook Skeleton */}
      <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    </div>
  );
}