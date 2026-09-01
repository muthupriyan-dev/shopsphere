import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-app py-24 text-center">
      <p className="font-display text-6xl text-moss-600 mb-2">404</p>
      <h1 className="font-display text-2xl text-ink mb-2">Page not found</h1>
      <p className="text-sm text-ink/60 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="text-moss-600 hover:underline font-medium">Back to home</Link>
    </div>
  )
}
