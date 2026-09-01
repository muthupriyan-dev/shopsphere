import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function AdminNavbar({ title }) {
  return (
    <div className="sticky top-16 z-30 flex items-center justify-between border-b border-line bg-paper/95 backdrop-blur px-4 py-4 md:px-6">
      <h1 className="font-display text-xl sm:text-2xl text-ink">{title}</h1>
      <Link to="/" className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to store
      </Link>
    </div>
  )
}
