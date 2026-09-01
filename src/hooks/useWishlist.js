import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// Simple in-memory cache shared across hook instances so every ProductCard
// doesn't issue its own query, and toggling in one place updates everywhere.
let cache = new Set()
let listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn())
}

export function useWishlist(productId) {
  const { user } = useAuth()
  const toast = useToast()
  const [, forceRender] = useState(0)

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1)
    listeners.add(listener)
    return () => listeners.delete(listener)
  }, [])

  useEffect(() => {
    if (!user) {
      cache = new Set()
      notify()
      return
    }
    supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        cache = new Set((data || []).map((w) => w.product_id))
        notify()
      })
  }, [user])

  const toggle = useCallback(
    async (product) => {
      if (!user) {
        toast.info('Please login to use your wishlist.')
        return
      }
      const id = product.id
      if (cache.has(id)) {
        cache.delete(id)
        notify()
        await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', id)
        toast.info('Removed from wishlist.')
      } else {
        cache.add(id)
        notify()
        await supabase.from('wishlists').insert({ user_id: user.id, product_id: id })
        toast.success('Added to wishlist.')
      }
    },
    [user, toast]
  )

  return { isWishlisted: cache.has(productId), toggle }
}
