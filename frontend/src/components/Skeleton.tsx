"use client";

// Skeleton loading components

export function SkeletonLine({ className = "", width = "100%" }: { className?: string; width?: string }) {
  return (
    <div
      className={`h-4 bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-elevated)] to-[var(--bg-secondary)] rounded animate-shimmer ${className}`}
      style={{ width, backgroundSize: "200% 100%" }}
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="space-y-4">
        <SkeletonLine width="60%" />
        <SkeletonLine width="100%" />
        <SkeletonLine width="80%" />
      </div>
    </div>
  );
}

export function SkeletonDebateCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-16 h-5 bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-elevated)] to-[var(--bg-secondary)] rounded animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
        <SkeletonLine width="40%" />
      </div>
      <SkeletonLine width="70%" className="mb-4" />
      <div className="flex justify-between items-center">
        <SkeletonLine width="20%" />
        <div className="w-24 h-9 bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-elevated)] to-[var(--bg-secondary)] rounded animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
      </div>
    </div>
  );
}

export function SkeletonMetricCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card p-6 text-center ${className}`}>
      <div className="h-10 w-20 mx-auto bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-elevated)] to-[var(--bg-secondary)] rounded animate-shimmer mb-2" style={{ backgroundSize: "200% 100%" }} />
      <SkeletonLine width="60%" className="mx-auto" />
    </div>
  );
}

export function SkeletonLeaderboard({ rows = 5, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-elevated)] to-[var(--bg-secondary)] rounded animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
              <div className="space-y-1">
                <SkeletonLine width="100px" />
                <SkeletonLine width="50px" className="h-3" />
              </div>
            </div>
            <SkeletonLine width="80px" />
          </div>
        ))}
      </div>
    </div>
  );
}
