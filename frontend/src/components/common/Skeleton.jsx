function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-surface-muted ${className}`} />
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-4">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="mt-3 h-7 w-2/3" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonRows({ count = 6 }) {
  return (
    <div className="surface-card overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-none border-b border-border last:border-0" />
      ))}
    </div>
  )
}

export default Skeleton
