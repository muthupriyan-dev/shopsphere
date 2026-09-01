export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl2 border border-line bg-white overflow-hidden animate-pulse">
      <div className="aspect-square bg-line/60" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/3 bg-line/60 rounded" />
        <div className="h-4 w-4/5 bg-line/60 rounded" />
        <div className="h-4 w-1/2 bg-line/60 rounded" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-line/60 ${className}`} />
}
