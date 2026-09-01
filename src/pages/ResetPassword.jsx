import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    toast.success('Password updated. Please log in again.')
    navigate('/login')
  }

  return (
    <div className="container-app max-w-md py-16">
      <h1 className="font-display text-2xl sm:text-3xl text-ink mb-1">Set a new password</h1>
      <p className="text-sm text-ink/60 mb-8">This link is only valid for a short time — you followed it from your email.</p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">New password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-moss-400 focus:outline-none" required />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-1.5">Confirm new password</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-moss-400 focus:outline-none" required />
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-moss-600 text-white py-2.5 text-sm font-medium hover:bg-moss-700 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Password
        </button>
      </form>
    </div>
  )
}
