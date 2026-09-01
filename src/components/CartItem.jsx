import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import QuantitySelector from './QuantitySelector'
import { formatCurrency } from '../lib/format'
import { useCart } from '../context/CartContext'

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart()

  return (
    <div className="flex gap-4 py-4 border-b border-line last:border-0">
      <Link to={`/products/${item.product.id}`} className="shrink-0">
        <img
          src={item.product.image_url}
          alt={item.product.name}
          className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover bg-moss-50"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <Link to={`/products/${item.product.id}`} className="font-medium text-sm sm:text-base text-ink hover:text-moss-600 line-clamp-2">
            {item.product.name}
          </Link>
          <button
            onClick={() => removeFromCart(item.id)}
            aria-label="Remove item"
            className="shrink-0 text-ink/40 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-ink/50 mt-0.5">{formatCurrency(item.product.price)} each</p>
        <div className="mt-3 flex items-center justify-between">
          <QuantitySelector
            quantity={item.quantity}
            max={item.product.stock}
            onChange={(q) => updateQuantity(item.id, q)}
            size="sm"
          />
          <span className="font-display text-ink">{formatCurrency(item.product.price * item.quantity)}</span>
        </div>
      </div>
    </div>
  )
}
