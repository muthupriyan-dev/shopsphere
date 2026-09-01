import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import StarRating from '../components/StarRating'
import { formatCurrency } from '../lib/format'

export default function Wishlist() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!user) return
    setLoading(true)
    supabase
      .from('wishlists')
      .select('id, product:products(*)')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setRows(data || [])
        setLoading(false)
      })
  }

  useEffect(load, [user])

  const remove = async (rowId) => {
    await supabase.from('wishlists').delete().eq('id', rowId)
    setRows((prev) => prev.filter((r) => r.id !== rowId))
  }

  const moveToCart = async (row) => {
    const { error } = await addToCart(row.product, 1)
    if (!error) {
      await remove(row.id)
      toast.success('Moved to cart.')
    }
  }

  if (!user) {
    return (
      <EmptyState
        icon={Heart}
        title="Login to view your wishlist"
        action={<Button as={Link} to="/login" state={{ from: { pathname: '/wishlist' } }}>Login</Button>}
      />
    )
  }

  if (loading) return <LoadingSpinner label="Loading your wishlist" className="py-24" />

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Save products you love so you can find them later."
        action={<Button as={Link} to="/products">Browse Products</Button>}
      />
    )
  }

  return (
    <div className="container-app py-8">
      <h1 className="font-display text-2xl sm:text-3xl text-ink mb-6">My Wishlist</h1>
      <div className="grid gap-4">
        {rows.map((row) => (
          <div key={row.id} className="flex gap-4 rounded-xl2 border border-line bg-white p-4">
            <Link to={`/products/${row.product.id}`} className="shrink-0">
              <img src={row.product.image_url} alt={row.product.name} className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover bg-moss-50" />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/products/${row.product.id}`} className="font-medium text-ink hover:text-moss-600 line-clamp-1">{row.product.name}</Link>
              <StarRating rating={row.product.rating} reviewCount={row.product.review_count} />
              <p className="font-display text-ink mt-1">{formatCurrency(row.product.price)}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => moveToCart(row)}
                  disabled={row.product.stock <= 0}
                  className="inline-flex items-center gap-1.5 rounded-full bg-moss-600 text-white text-xs px-3 py-1.5 hover:bg-moss-700 disabled:bg-line disabled:text-ink/40"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Move to Cart
                </button>
                <button
                  onClick={() => remove(row.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line text-xs px-3 py-1.5 hover:border-ink/30"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
