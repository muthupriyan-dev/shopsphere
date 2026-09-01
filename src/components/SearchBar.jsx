import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search products...', className = '' }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(value)
      }}
      className={`relative flex-1 ${className}`}
      role="search"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-9 text-sm focus:border-moss-400 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  )
}
