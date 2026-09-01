import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="rounded-full border border-line p-2 disabled:opacity-30 hover:border-ink/30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm text-ink/70 px-2">Page {page} of {totalPages}</span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="rounded-full border border-line p-2 disabled:opacity-30 hover:border-ink/30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
