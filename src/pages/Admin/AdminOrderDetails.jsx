import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../../context/ToastContext'
import AdminNavbar from '../../components/AdminNavbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import { formatCurrency, formatDate } from '../../lib/format'

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']

export default function AdminOrderDetails() {
  const { id } = useParams()
  const toast = useToast()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = () => {
    supabase
      .from('orders')
      .select('*, order_items(*), profile:profiles(full_name, email, phone)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setOrder(data)
        setLoading(false)
      })
  }

  useEffect(load, [id])

  const updateField = async (field, value) => {
    setSaving(true)
    const { error } = await supabase.from('orders').update({ [field]: value }).eq('id', id)
    setSaving(false)
    if (error) {
      toast.error('Could not update order.')
      return
    }
    setOrder((o) => ({ ...o, [field]: value }))
    toast.success('Order updated.')
  }

  if (loading) return <LoadingSpinner label="Loading order" className="py-24" />
  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-ink/60">Order not found.</p>
        <Link to="/admin/orders" className="text-moss-600 hover:underline text-sm">Back to orders</Link>
      </div>
    )
  }

  return (
    <div>
      <AdminNavbar title={`Order #${order.id.slice(0, 8).toUpperCase()}`} />
      <div className="p-4 md:p-6 max-w-3xl space-y-6">
        <div className="rounded-xl2 border border-line bg-white p-5 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-ink/50">Customer</p>
            <p className="text-ink font-medium">{order.profile?.full_name || order.shipping_name}</p>
            <p className="text-ink/60">{order.profile?.email || order.shipping_email}</p>
          </div>
          <div>
            <p className="text-ink/50">Order date</p>
            <p className="text-ink">{formatDate(order.created_at)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-ink/50">Shipping address</p>
            <p className="text-ink">{order.shipping_address}, {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}, {order.shipping_country}</p>
          </div>
        </div>

        <div className="rounded-xl2 border border-line bg-white p-5">
          <h2 className="font-semibold text-ink mb-3">Update Status</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Order status</label>
              <select
                value={order.order_status}
                disabled={saving}
                onChange={(e) => updateField('order_status', e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 text-sm capitalize"
              >
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Payment status</label>
              <select
                value={order.payment_status}
                disabled={saving}
                onChange={(e) => updateField('payment_status', e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-2.5 text-sm capitalize"
              >
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3"><OrderStatusBadge status={order.order_status} /></div>
        </div>

        <div className="rounded-xl2 border border-line bg-white p-5">
          <h2 className="font-semibold text-ink mb-3">Items</h2>
          <div className="divide-y divide-line">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between py-2.5 text-sm">
                <span className="text-ink/70">{item.product_name} × {item.quantity}</span>
                <span className="text-ink">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-line pt-3 mt-2 flex justify-between font-semibold">
            <span>Total</span><span>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
