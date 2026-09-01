import { Minus, Plus } from 'lucide-react'

export default function QuantitySelector({ quantity, onChange, max = 99, size = 'md' }) {
  const pad = size === 'sm' ? 'px-2 py-1' : 'px-3 py-2'
  return (
    <div className="inline-flex items-center rounded-full border border-line">
      <button
        type="button"
        aria-label="Decrease quantity"
        className={`${pad} text-ink/70 hover:text-ink disabled:opacity-30`}
        disabled={quantity <= 1}
        onClick={() => onChange(quantity - 1)}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-medium" aria-live="polite">{quantity}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={`${pad} text-ink/70 hover:text-ink disabled:opacity-30`}
        disabled={quantity >= max}
        onClick={() => onChange(quantity + 1)}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
