import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import AdminNavbar from '../../components/AdminNavbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import { formatCurrency, formatDate } from '../../lib/format'

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, profile:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.order_status === filter)

  return (
    <div>
      <AdminNavbar title="Orders" />
      <div className="p-4 md:p-6">
        <div className="flex flex-wrap gap-2 mb-5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${
                filter === s ? 'border-moss-600 bg-moss-50 text-moss-700' : 'border-line text-ink/60 hover:border-ink/30'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner label="Loading orders" />
        ) : (
          <div className="rounded-xl2 border border-line bg-white overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-line text-left text-ink/50">
                  <th className="p-3 font-medium">Order</th>
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Total</th>
                  <th className="p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-ink/[0.02]">
                    <td className="p-3">
                      <Link to={`/admin/orders/${o.id}`} className="font-medium text-moss-700 hover:underline">
                        #{o.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="p-3 text-ink/70">{o.profile?.full_name || o.shipping_name}</td>
                    <td className="p-3 text-ink/60">{formatDate(o.created_at)}</td>
                    <td className="p-3 text-ink">{formatCurrency(o.total_amount)}</td>
                    <td className="p-3"><OrderStatusBadge status={o.order_status} /></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-ink/50">No orders in this status.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
