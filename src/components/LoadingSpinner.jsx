import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ label = 'Loading', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 py-10 text-ink/60 ${className}`} role="status" aria-live="polite">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}...</span>
    </div>
  )
}
