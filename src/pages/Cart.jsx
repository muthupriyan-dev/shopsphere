import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import CartItem from '../components/CartItem'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import Button from '../components/Button'
import { formatCurrency } from '../lib/format'

export default function Cart() {
  const { items, loading, subtotal, discount, shipping, total } = useCart()
  const { user } = useAuth()

  if (!user) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Login to view your cart"
        description="Your cart is saved to your account so it's here whenever you come back."
        action={
          <Button as={Link} to="/login" state={{ from: { pathname: '/cart' } }}>
            Login
          </Button>
        }
      />
    )
  }

  if (loading) return <LoadingSpinner label="Loading your cart" className="py-24" />

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Browse our catalog and find something you'll love."
        action={<Button as={Link} to="/products">Continue Shopping</Button>}
      />
    )
  }

  return (
    <div className="container-app py-8">
      <h1 className="font-display text-2xl sm:text-3xl text-ink mb-6">Shopping Cart</h1>
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="rounded-xl2 border border-line bg-white p-4 sm:p-6">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div className="rounded-xl2 border border-line bg-white p-5 h-fit sticky top-24">
          <h2 className="font-display text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-moss-600">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink/70">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
            </div>
            <div className="border-t border-line my-2" />
            <div className="flex justify-between font-semibold text-ink text-base">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <Button as={Link} to="/checkout" className="w-full mt-5">Proceed to Checkout</Button>
          <Button as={Link} to="/products" variant="ghost" className="w-full mt-2">Continue Shopping</Button>
        </div>
      </div>
    </div>
  )
}
