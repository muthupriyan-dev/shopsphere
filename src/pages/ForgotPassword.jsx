import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    const { error } = await sendPasswordReset(email)
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  return (
    <div className="container-app max-w-md py-16">
      <h1 className="font-display text-2xl sm:text-3xl text-ink mb-1">Reset your password</h1>
      <p className="text-sm text-ink/60 mb-8">Enter your email and we'll send you a reset link.</p>

      {sent ? (
        <p className="text-sm text-ink/70">
          If an account exists for <strong>{email}</strong>, a password reset link is on its way.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-moss-400 focus:outline-none" required />
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-moss-600 text-white py-2.5 text-sm font-medium hover:bg-moss-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Send Reset Link
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink/60">
        <Link to="/login" className="text-moss-600 hover:underline font-medium">Back to login</Link>
      </p>
    </div>
  )
}
