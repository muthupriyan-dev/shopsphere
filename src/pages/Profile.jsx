import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, User, Package, Heart, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const toast = useToast()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFullName(profile?.full_name || '')
    setPhone(profile?.phone || '')
  }, [profile])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { supabase } = await import('../lib/supabaseClient')
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id)
    setSaving(false)
    if (error) {
      toast.error('Could not update profile.')
      return
    }
    await refreshProfile()
    toast.success('Profile updated.')
  }

  return (
    <div className="container-app max-w-3xl py-8">
      <h1 className="font-display text-2xl sm:text-3xl text-ink mb-6">My Profile</h1>

      <div className="grid sm:grid-cols-[180px_1fr] gap-8">
        <nav className="flex sm:flex-col gap-1 overflow-x-auto">
          <span className="flex items-center gap-2 rounded-lg bg-moss-50 text-moss-700 px-3 py-2.5 text-sm font-medium whitespace-nowrap">
            <User className="h-4 w-4" /> Personal Info
          </span>
          <Link to="/orders" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ink/70 hover:bg-ink/5 whitespace-nowrap">
            <Package className="h-4 w-4" /> My Orders
          </Link>
          <Link to="/wishlist" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ink/70 hover:bg-ink/5 whitespace-nowrap">
            <Heart className="h-4 w-4" /> Wishlist
          </Link>
          <button onClick={signOut} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 whitespace-nowrap">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </nav>

        <form onSubmit={handleSave} className="rounded-xl2 border border-line bg-white p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-moss-400 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
            <input value={user?.email || ''} disabled className="w-full rounded-xl border border-line bg-ink/5 px-4 py-2.5 text-sm text-ink/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-moss-400 focus:outline-none" />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-moss-600 text-white px-6 py-2.5 text-sm font-medium hover:bg-moss-700 disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}
