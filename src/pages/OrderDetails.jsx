import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import OrderStatusBadge from '../components/OrderStatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import Button from '../components/Button'
import { formatCurrency, formatDate } from '../lib/format'

export default function OrderDetails() {
  const { id } = useParams()
  const location = useLocation()
  const justPlaced = location.state?.justPlaced
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setOrder(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <LoadingSpinner label="Loading order" className="py-24" />
  if (!order) {
    return (
      <div className="container-app py-24 text-center">
        <h1 className="font-display text-2xl mb-2">Order not found</h1>
        <Link to="/orders" className="text-moss-600 hover:underline">Back to my orders</Link>
      </div>
    )
  }

  return (
    <div className="container-app max-w-2xl py-8">
      {justPlaced && (
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-moss-50 text-moss-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink">Order Placed Successfully!</h1>
          <p className="text-sm text-ink/60 mt-1">Thank you — we've received your order.</p>
        </div>
      )}

      <div className="rounded-xl2 border border-line bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <p className="text-sm text-ink/50">Order ID</p>
            <p className="font-semibold text-ink">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <OrderStatusBadge status={order.order_status} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p className="text-ink/50">Order date</p>
            <p className="text-ink">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-ink/50">Payment method</p>
            <p className="text-ink capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Demo Online Payment'} · <span className="capitalize">{order.payment_status}</span></p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-ink/50">Shipping address</p>
            <p className="text-ink">{order.shipping_name}, {order.shipping_address}, {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}, {order.shipping_country}</p>
          </div>
        </div>

        <h2 className="text-sm font-semibold mb-2">Items</h2>
        <div className="divide-y divide-line mb-4">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between py-2.5 text-sm">
              <span className="text-ink/70">{item.product_name} × {item.quantity}</span>
              <span className="text-ink">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-line pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-ink/60"><span>Discount</span><span>-{formatCurrency(order.discount_amount)}</span></div>
          <div className="flex justify-between text-ink/60"><span>Shipping</span><span>{order.shipping_amount === 0 ? 'Free' : formatCurrency(order.shipping_amount)}</span></div>
          <div className="flex justify-between font-semibold text-base text-ink"><span>Total</span><span>{formatCurrency(order.total_amount)}</span></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <Button as={Link} to="/orders" variant="secondary">
          <ArrowLeft className="h-4 w-4" /> All Orders
        </Button>
        <Button as={Link} to="/products">Continue Shopping</Button>
      </div>
    </div>
  )
}
