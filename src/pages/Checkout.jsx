import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Loader2, Truck, CreditCard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabaseClient'
import { formatCurrency } from '../lib/format'

const initialForm = {
  fullName: '', email: '', phone: '', address: '', city: '', state: '', postalCode: '', country: 'India',
}

export default function Checkout() {
  const { user, profile } = useAuth()
  const { items, subtotal, discount, shipping, total, clearCart } = useCart()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    ...initialForm,
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)

  if (!user) return <Navigate to="/login" state={{ from: { pathname: '/checkout' } }} replace />
  if (items.length === 0) return <Navigate to="/cart" replace />

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const req = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'country']
    const next = {}
    req.forEach((key) => {
      if (!form[key]?.trim()) next[key] = 'Required'
    })
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Invalid email'
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) next.phone = 'Invalid phone number'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setPlacing(true)

    // Re-check stock right before placing the order, in case it changed.
    const productIds = items.map((i) => i.product.id)
    const { data: freshProducts, error: stockError } = await supabase
      .from('products')
      .select('id, stock, name')
      .in('id', productIds)

    if (stockError) {
      toast.error('Could not verify stock. Please try again.')
      setPlacing(false)
      return
    }

    const insufficient = items.find((i) => {
      const fresh = freshProducts.find((p) => p.id === i.product.id)
      return !fresh || fresh.stock < i.quantity
    })
    if (insufficient) {
      toast.error(`${insufficient.product.name} no longer has enough stock. Please update your cart.`)
      setPlacing(false)
      return
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: total,
        shipping_amount: shipping,
        discount_amount: discount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'demo_online' ? 'paid' : 'pending',
        order_status: 'confirmed',
        shipping_name: form.fullName,
        shipping_email: form.email,
        shipping_phone: form.phone,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_state: form.state,
        shipping_postal_code: form.postalCode,
        shipping_country: form.country,
      })
      .select()
      .single()

    if (orderError) {
      toast.error('Could not place your order. Please try again.')
      setPlacing(false)
      return
    }

    const orderItemsPayload = items.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      product_name: i.product.name,
      product_price: i.product.price,
      quantity: i.quantity,
      subtotal: i.product.price * i.quantity,
    }))
    await supabase.from('order_items').insert(orderItemsPayload)

    // Reduce stock for each product ordered.
    await Promise.all(
      items.map((i) => {
        const fresh = freshProducts.find((p) => p.id === i.product.id)
        return supabase.from('products').update({ stock: fresh.stock - i.quantity }).eq('id', i.product.id)
      })
    )

    await clearCart()
    setPlacing(false)
    navigate(`/orders/${order.id}`, { state: { justPlaced: true } })
  }

  return (
    <div className="container-app py-8">
      <h1 className="font-display text-2xl sm:text-3xl text-ink mb-6">Checkout</h1>
      <form onSubmit={handlePlaceOrder} noValidate className="grid lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-6">
          <div className="rounded-xl2 border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-semibold text-ink mb-4">
              <Truck className="h-4 w-4" /> Shipping Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" value={form.fullName} onChange={set('fullName')} error={errors.fullName} />
              <Field label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} />
              <Field label="Phone" value={form.phone} onChange={set('phone')} error={errors.phone} />
              <Field label="Country" value={form.country} onChange={set('country')} error={errors.country} />
              <Field label="Address" value={form.address} onChange={set('address')} error={errors.address} className="sm:col-span-2" />
              <Field label="City" value={form.city} onChange={set('city')} error={errors.city} />
              <Field label="State" value={form.state} onChange={set('state')} error={errors.state} />
              <Field label="Postal code" value={form.postalCode} onChange={set('postalCode')} error={errors.postalCode} />
            </div>
          </div>

          <div className="rounded-xl2 border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-semibold text-ink mb-4">
              <CreditCard className="h-4 w-4" /> Payment Method
            </h2>
            <div className="space-y-2">
              <label className="flex items-center gap-3 rounded-xl border border-line p-3 cursor-pointer has-[:checked]:border-moss-500 has-[:checked]:bg-moss-50">
                <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <div>
                  <p className="text-sm font-medium">Cash on Delivery</p>
                  <p className="text-xs text-ink/50">Pay when your order arrives</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-line p-3 cursor-pointer has-[:checked]:border-moss-500 has-[:checked]:bg-moss-50">
                <input type="radio" checked={paymentMethod === 'demo_online'} onChange={() => setPaymentMethod('demo_online')} />
                <div>
                  <p className="text-sm font-medium">Demo Online Payment</p>
                  <p className="text-xs text-ink/50">Simulated payment for this demo — no card details required</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-xl2 border border-line bg-white p-5 h-fit sticky top-24">
          <h2 className="font-display text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm gap-2">
                <span className="text-ink/70 line-clamp-1">{i.product.name} × {i.quantity}</span>
                <span className="shrink-0">{formatCurrency(i.product.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-line pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-ink/70"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-moss-600"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
            <div className="flex justify-between text-ink/70"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span></div>
            <div className="border-t border-line my-1" />
            <div className="flex justify-between font-semibold text-base"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
          <button
            type="submit"
            disabled={placing}
            className="w-full mt-5 rounded-full bg-moss-600 text-white py-2.5 text-sm font-medium hover:bg-moss-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {placing && <Loader2 className="h-4 w-4 animate-spin" />}
            Place Order
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, error, type = 'text', className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none ${error ? 'border-red-400' : 'border-line focus:border-moss-400'}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
