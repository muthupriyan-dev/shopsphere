import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import StarRating from './StarRating'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../hooks/useWishlist'
import { formatCurrency } from '../lib/format'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isWishlisted, toggle } = useWishlist(product.id)
  const outOfStock = product.stock <= 0

  return (
    <div className="group relative rounded-xl2 border border-line bg-white overflow-hidden transition-shadow hover:shadow-soft">
      <button
        onClick={() => toggle(product)}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm text-ink/60 hover:text-clay"
      >
        <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-clay text-clay' : ''}`} />
      </button>

      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-moss-50">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="p-3 sm:p-4">
        {product.category?.name && (
          <p className="text-[11px] uppercase tracking-wide text-ink/40 mb-1">{product.category.name}</p>
        )}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-sm sm:text-base text-ink line-clamp-2 mb-1 hover:text-moss-600">
            {product.name}
          </h3>
        </Link>
        <StarRating rating={product.rating} reviewCount={product.review_count} />

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-base sm:text-lg text-ink">{formatCurrency(product.price)}</span>
          {product.original_price > product.price && (
            <span className="text-xs text-ink/40 line-through">{formatCurrency(product.original_price)}</span>
          )}
        </div>

        {outOfStock ? (
          <p className="mt-2 text-xs font-medium text-red-600">Out of stock</p>
        ) : product.stock <= 5 ? (
          <p className="mt-2 text-xs font-medium text-amber-600">Only {product.stock} left</p>
        ) : null}

        <button
          onClick={() => addToCart(product, 1)}
          disabled={outOfStock}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-moss-600 text-white text-sm py-2 hover:bg-moss-700 disabled:bg-line disabled:text-ink/40"
        >
          <ShoppingBag className="h-4 w-4" />
          {outOfStock ? 'Unavailable' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
