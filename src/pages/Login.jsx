import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { signIn } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    const { error } = await signIn({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message)
      return
    }
    toast.success('Welcome back!')
    navigate(from, { replace: true })
  }

  return (
    <div className="container-app max-w-md py-16">
      <h1 className="font-display text-2xl sm:text-3xl text-ink mb-1">Welcome back</h1>
      <p className="text-sm text-ink/60 mb-8">Login to continue shopping on ShopSphere.</p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-moss-400 focus:outline-none"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-2.5 pr-10 text-sm focus:border-moss-400 focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-1.5 text-right">
            <Link to="/forgot-password" className="text-xs text-moss-600 hover:underline">Forgot password?</Link>
          </div>
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-moss-600 text-white py-2.5 text-sm font-medium hover:bg-moss-700 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Login
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Don't have an account? <Link to="/register" className="text-moss-600 hover:underline font-medium">Register</Link>
      </p>
    </div>
  )
}
