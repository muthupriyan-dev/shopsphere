import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const { signUp } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const validate = () => {
    if (!fullName.trim()) return 'Please enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address.'
    if (password.length < 8) return 'Password must be at least 8 characters.'
    if (password !== confirmPassword) return 'Passwords do not match.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    setError(validationError)
    if (validationError) return

    setLoading(true)
    const { error } = await signUp({ email, password, fullName })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }
    setDone(true)
    toast.success('Account created!')
  }

  if (done) {
    return (
      <div className="container-app max-w-md py-16 text-center">
        <h1 className="font-display text-2xl text-ink mb-2">Check your inbox</h1>
        <p className="text-sm text-ink/60 mb-6">
          We've sent a confirmation link to <strong>{email}</strong>. Confirm your email, then log in to start shopping.
        </p>
        <Link to="/login" className="text-moss-600 hover:underline font-medium text-sm">Go to login</Link>
      </div>
    )
  }

  return (
    <div className="container-app max-w-md py-16">
      <h1 className="font-display text-2xl sm:text-3xl text-ink mb-1">Create your account</h1>
      <p className="text-sm text-ink/60 mb-8">Join ShopSphere to save your cart, wishlist, and orders.</p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-ink mb-1.5">Full name</label>
          <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-moss-400 focus:outline-none" required />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-moss-400 focus:outline-none" required />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-2.5 pr-10 text-sm focus:border-moss-400 focus:outline-none"
              required
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-ink/40">At least 8 characters.</p>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-1.5">Confirm password</label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-moss-400 focus:outline-none"
            required
          />
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-moss-600 text-white py-2.5 text-sm font-medium hover:bg-moss-700 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account? <Link to="/login" className="text-moss-600 hover:underline font-medium">Login</Link>
      </p>
    </div>
  )
}
