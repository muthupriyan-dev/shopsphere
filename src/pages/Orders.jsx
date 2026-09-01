import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import OrderStatusBadge from '../components/OrderStatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import { formatCurrency, formatDate } from '../lib/format'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('orders')
      .select('*, order_items(id, product_name, quantity)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || [])
        setLoading(false)
      })
  }, [user])

  if (loading) return <LoadingSpinner label="Loading your orders" className="py-24" />

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="Once you place an order, you'll be able to track it here."
        action={<Button as={Link} to="/products">Start Shopping</Button>}
      />
    )
  }

  return (
    <div className="container-app py-8 max-w-3xl">
      <h1 className="font-display text-2xl sm:text-3xl text-ink mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block rounded-xl2 border border-line bg-white p-5 hover:border-ink/20 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <p className="text-sm font-semibold text-ink">Order #{order.id.slice(0, 8).toUpperCase()}</p>
              <OrderStatusBadge status={order.order_status} />
            </div>
            <p className="text-xs text-ink/50 mb-2">{formatDate(order.created_at)} · {order.order_items.length} item(s)</p>
            <p className="text-sm text-ink/70 line-clamp-1 mb-2">
              {order.order_items.map((i) => `${i.product_name} × ${i.quantity}`).join(', ')}
            </p>
            <p className="font-display text-lg text-ink">{formatCurrency(order.total_amount)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
