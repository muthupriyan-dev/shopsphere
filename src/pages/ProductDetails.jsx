import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Heart, ShoppingBag, Zap, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useWishlist } from '../hooks/useWishlist'
import StarRating from '../components/StarRating'
import QuantitySelector from '../components/QuantitySelector'
import LoadingSpinner from '../components/LoadingSpinner'
import ProductGrid from '../components/ProductGrid'
import { formatCurrency, formatDate } from '../lib/format'
import { useNavigate } from 'react-router-dom'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const toast = useToast()
  const { isWishlisted, toggle } = useWishlist(id)

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [reviews, setReviews] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setQuantity(1)

    async function load() {
      const { data: prod } = await supabase
        .from('products')
        .select('*, category:categories(id, name, slug)')
        .eq('id', id)
        .single()
      if (!mounted) return
      setProduct(prod)

      if (prod?.category_id) {
        const { data: rel } = await supabase
          .from('products')
          .select('*, category:categories(name)')
          .eq('category_id', prod.category_id)
          .neq('id', id)
          .limit(4)
        if (mounted) setRelated(rel || [])
      }

      const { data: revs } = await supabase
        .from('reviews')
        .select('*, profile:profiles(full_name)')
        .eq('product_id', id)
        .order('created_at', { ascending: false })
      if (mounted) setReviews(revs || [])

      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [id])

  if (loading) return <LoadingSpinner label="Loading product" className="py-24" />
  if (!product) {
    return (
      <div className="container-app py-24 text-center">
        <h1 className="font-display text-2xl mb-2">Product not found</h1>
        <Link to="/products" className="text-moss-600 hover:underline">Back to all products</Link>
      </div>
    )
  }

  const outOfStock = product.stock <= 0
  const discount = product.original_price > product.price
    ? Math.round(100 - (product.price / product.original_price) * 100)
    : 0

  const handleBuyNow = async () => {
    const { error } = await addToCart(product, quantity)
    if (!error) navigate('/checkout')
  }

  return (
    <div className="container-app py-8">
      <nav className="flex items-center gap-1.5 text-xs text-ink/50 mb-6">
        <Link to="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/products" className="hover:text-ink">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/category/${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link>
          </>
        )}
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-xl2 overflow-hidden bg-moss-50">
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div>
          {product.category && (
            <p className="text-xs uppercase tracking-wide text-ink/40 mb-2">{product.category.name}</p>
          )}
          <h1 className="font-display text-2xl sm:text-3xl text-ink mb-2">{product.name}</h1>
          <StarRating rating={product.rating} reviewCount={product.review_count} size="md" />

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl text-ink">{formatCurrency(product.price)}</span>
            {discount > 0 && (
              <>
                <span className="text-lg text-ink/40 line-through">{formatCurrency(product.original_price)}</span>
                <span className="rounded-full bg-clay/10 text-clay text-sm font-medium px-2.5 py-0.5">{discount}% off</span>
              </>
            )}
          </div>

          <p className="mt-4 text-sm text-ink/70 leading-relaxed">{product.description}</p>

          <div className="mt-4">
            {outOfStock ? (
              <p className="text-sm font-medium text-red-600">Out of stock</p>
            ) : (
              <p className="text-sm text-ink/60">
                {product.stock <= 5 ? <span className="text-amber-600 font-medium">Only {product.stock} left in stock</span> : `${product.stock} in stock`}
              </p>
            )}
          </div>

          {!outOfStock && (
            <div className="mt-5 flex items-center gap-4">
              <span className="text-sm font-medium text-ink/70">Quantity</span>
              <QuantitySelector quantity={quantity} onChange={setQuantity} max={product.stock} />
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={outOfStock}
              onClick={() => addToCart(product, quantity)}
              className="inline-flex items-center gap-2 rounded-full bg-moss-600 text-white px-6 py-3 text-sm font-medium hover:bg-moss-700 disabled:bg-line disabled:text-ink/40"
            >
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </button>
            <button
              disabled={outOfStock}
              onClick={handleBuyNow}
              className="inline-flex items-center gap-2 rounded-full bg-clay text-white px-6 py-3 text-sm font-medium hover:brightness-95 disabled:bg-line disabled:text-ink/40"
            >
              <Zap className="h-4 w-4" /> Buy Now
            </button>
            <button
              onClick={() => toggle(product)}
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium hover:border-ink/30"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-clay text-clay' : ''}`} />
              {isWishlisted ? 'Wishlisted' : 'Wishlist'}
            </button>
          </div>

          <div className="mt-8 rounded-xl2 border border-line p-4">
            <h2 className="text-sm font-semibold mb-2">Specifications</h2>
            <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-ink/50">Category</dt>
              <dd className="text-ink/80">{product.category?.name || '—'}</dd>
              <dt className="text-ink/50">Rating</dt>
              <dd className="text-ink/80">{product.rating} / 5 ({product.review_count} reviews)</dd>
              <dt className="text-ink/50">Availability</dt>
              <dd className="text-ink/80">{outOfStock ? 'Out of stock' : 'In stock'}</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-14">
        <h2 className="font-display text-2xl text-ink mb-4">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-ink/50">No reviews yet for this product.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl2 border border-line p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{r.profile?.full_name || 'Verified buyer'}</p>
                  <p className="text-xs text-ink/40">{formatDate(r.created_at)}</p>
                </div>
                <StarRating rating={r.rating} />
                {r.review_text && <p className="mt-2 text-sm text-ink/70">{r.review_text}</p>}
              </div>
            ))}
          </div>
        )}
        {!user && <p className="mt-3 text-xs text-ink/40">Log in and purchase this product to leave a review.</p>}
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl text-ink mb-4">You may also like</h2>
          <ProductGrid products={related} loading={false} />
        </section>
      )}
    </div>
  )
}
