export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ background: "linear-gradient(135deg, #e2e6ec 0%, #edf0f5 100%)" }}
    />
  );
}

export function HomeSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 animate-fade-in">
      {/* Hero Skeleton */}
      <div className="relative overflow-hidden rounded-2xl p-8 sm:p-12"
        style={{ background: "linear-gradient(135deg, #0f2447 0%, #1a3666 50%, #2c5294 100%)" }}>
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <Skeleton className="h-6 w-28 mx-auto rounded-full" style={{ background: "rgba(232,168,56,0.15)" }} />
          <Skeleton className="h-10 w-3/4 mx-auto rounded-xl" style={{ background: "rgba(255,255,255,0.1)" }} />
          <Skeleton className="h-4 w-1/2 mx-auto rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
          <Skeleton className="h-3 w-1/4 mx-auto rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>
      </div>

      {/* Flipbook Viewer Container Skeleton */}
      <div className="w-full aspect-[16/10] sm:aspect-[16/9] max-w-5xl mx-auto rounded-2xl overflow-hidden"
        style={{ border: "1px solid #edf0f5" }}>
        <Skeleton className="w-full h-full" style={{ background: "rgba(15,36,71,0.03)" }} />
      </div>

      {/* Grid Majalah Lainnya Skeleton */}
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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title & Desc Skeleton */}
      <header className="space-y-3 pb-6" style={{ borderBottom: "1px solid #edf0f5" }}>
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-9 w-2/3 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </header>

      {/* Flipbook Skeleton */}
      <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden"
        style={{ border: "1px solid #edf0f5" }}>
        <Skeleton className="w-full h-full" style={{ background: "rgba(15,36,71,0.03)" }} />
      </div>
    </div>
  );
}
