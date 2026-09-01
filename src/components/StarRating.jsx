import { Star } from 'lucide-react'

export default function StarRating({ rating = 0, reviewCount, size = 'sm' }) {
  const dim = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${dim} ${i < Math.round(rating) ? 'fill-clay text-clay' : 'text-line'}`}
          />
        ))}
      </div>
      {typeof reviewCount === 'number' && (
        <span className="text-xs text-ink/50">({reviewCount})</span>
      )}
    </div>
  )
}
