import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import AdminNavbar from '../../components/AdminNavbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'
import { formatDate } from '../../lib/format'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [orderHistory, setOrderHistory] = useState([])

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setUsers(data || [])
      setLoading(false)
    })
  }, [])

  const openDetails = async (u) => {
    setSelected(u)
    const { data } = await supabase.from('orders').select('id, total_amount, order_status, created_at').eq('user_id', u.id).order('created_at', { ascending: false })
    setOrderHistory(data || [])
  }

  const changeRole = async (u, role) => {
    if (u.id === currentUser.id) {
      toast.error("You can't change your own role.")
      return
    }
    const { error } = await supabase.from('profiles').update({ role }).eq('id', u.id)
    if (error) {
      toast.error('Could not update role.')
      return
    }
    setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, role } : p)))
    setSelected((s) => (s ? { ...s, role } : s))
    toast.success('Role updated.')
  }

  if (loading) return <LoadingSpinner label="Loading users" className="py-24" />

  return (
    <div>
      <AdminNavbar title="Users" />
      <div className="p-4 md:p-6">
        <div className="rounded-xl2 border border-line bg-white overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-line text-left text-ink/50">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-ink/[0.02] cursor-pointer" onClick={() => openDetails(u)}>
                  <td className="p-3 font-medium text-ink">{u.full_name || '—'}</td>
                  <td className="p-3 text-ink/60">{u.email}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${u.role === 'admin' ? 'bg-clay/10 text-clay' : 'bg-ink/5 text-ink/60'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-ink/60">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.full_name || 'User details'}>
        {selected && (
          <div className="space-y-4">
            <div className="text-sm">
              <p className="text-ink/50">Email</p>
              <p className="text-ink">{selected.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Role</label>
              <select
                value={selected.role}
                onChange={(e) => changeRole(selected, e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2 text-sm"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Order history</h3>
              {orderHistory.length === 0 ? (
                <p className="text-sm text-ink/50">No orders yet.</p>
              ) : (
                <ul className="space-y-1.5 text-sm max-h-40 overflow-y-auto">
                  {orderHistory.map((o) => (
                    <li key={o.id} className="flex justify-between text-ink/70">
                      <span>#{o.id.slice(0, 8).toUpperCase()} · {formatDate(o.created_at)}</span>
                      <span className="capitalize">{o.order_status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
