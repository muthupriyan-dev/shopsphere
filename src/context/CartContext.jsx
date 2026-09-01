import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const toast = useToast()
  const [items, setItems] = useState([]) // [{ id, quantity, product }]
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([])
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, quantity, product:products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    if (!error) setItems(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      toast.info('Please login to add items to your cart.')
      return { error: 'not_authenticated' }
    }
    const existing = items.find((i) => i.product.id === product.id)
    const desiredQty = (existing?.quantity || 0) + quantity
    if (desiredQty > product.stock) {
      toast.error(`Only ${product.stock} in stock.`)
      return { error: 'out_of_stock' }
    }
    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: desiredQty })
        .eq('id', existing.id)
      if (!error) {
        setItems((prev) => prev.map((i) => (i.id === existing.id ? { ...i, quantity: desiredQty } : i)))
        toast.success('Cart updated.')
      }
      return { error }
    }
    const { data, error } = await supabase
      .from('cart_items')
      .insert({ user_id: user.id, product_id: product.id, quantity })
      .select('id, quantity, product:products(*)')
      .single()
    if (!error) {
      setItems((prev) => [...prev, data])
      toast.success('Added to cart.')
    }
    return { error }
  }

  const updateQuantity = async (cartItemId, quantity) => {
    const item = items.find((i) => i.id === cartItemId)
    if (!item) return
    if (quantity < 1) return
    if (quantity > item.product.stock) {
      toast.error(`Only ${item.product.stock} in stock.`)
      return
    }
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId)
    if (!error) setItems((prev) => prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i)))
  }

  const removeFromCart = async (cartItemId) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId)
    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== cartItemId))
      toast.info('Item removed from cart.')
    }
  }

  const clearCart = async () => {
    if (!user) return
    await supabase.from('cart_items').delete().eq('user_id', user.id)
    setItems([])
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    const originalSubtotal = items.reduce(
      (sum, i) => sum + (i.product.original_price || i.product.price) * i.quantity,
      0
    )
    const discount = Math.max(0, originalSubtotal - subtotal)
    const shipping = subtotal > 0 && subtotal < 999 ? 79 : 0
    const total = subtotal + shipping
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
    return { subtotal, discount, shipping, total, itemCount }
  }, [items])

  const value = { items, loading, addToCart, updateQuantity, removeFromCart, clearCart, refreshCart: fetchCart, ...totals }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
