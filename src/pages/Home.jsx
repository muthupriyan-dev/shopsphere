import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import ProductGrid from '../components/ProductGrid'
import CategoryCard from '../components/CategoryCard'

const benefits = [
  { icon: Truck, title: 'Free shipping', desc: 'On every order over ₹999' },
  { icon: ShieldCheck, title: 'Secure checkout', desc: 'Your data is always protected' },
  { icon: RotateCcw, title: 'Easy returns', desc: '7-day hassle-free returns' },
  { icon: Headphones, title: '24/7 support', desc: "We're here whenever you need us" },
]

export default function Home() {
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      const [cats, feat, best, latest] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select('*, category:categories(name)').gt('discount_percentage', 0).order('discount_percentage', { ascending: false }).limit(8),
        supabase.from('products').select('*, category:categories(name)').order('review_count', { ascending: false }).limit(8),
        supabase.from('products').select('*, category:categories(name)').order('created_at', { ascending: false }).limit(8),
      ])
      if (!mounted) return
      setCategories(cats.data || [])
      setFeatured(feat.data || [])
      setBestSellers(best.data || [])
      setNewArrivals(latest.data || [])
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-gradient-to-b from-moss-50 to-paper">
        <div className="container-app py-16 sm:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-medium text-moss-600 mb-3 tracking-wide uppercase">ShopSphere</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-ink mb-5">
              Everything You Need, All in One Place
            </h1>
            <p className="text-base sm:text-lg text-ink/60 mb-8 max-w-md">
              Discover quality products at great prices.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-moss-600 text-white px-6 py-3 text-sm font-medium hover:bg-moss-700">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/products" className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-sm font-medium hover:border-ink/40">
                Explore Categories
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-xl2 overflow-hidden shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000"
                alt="Curated products from the ShopSphere catalog"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-app py-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {benefits.map((b) => (
          <div key={b.title} className="flex flex-col items-start gap-2 rounded-xl2 border border-line bg-white p-4 sm:p-5">
            <b.icon className="h-5 w-5 text-moss-600" />
            <p className="text-sm font-semibold text-ink">{b.title}</p>
            <p className="text-xs text-ink/50">{b.desc}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="container-app py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl sm:text-3xl text-ink">Popular Categories</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* Featured / Promo */}
      <section className="container-app py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl sm:text-3xl text-ink">Featured Deals</h2>
          <Link to="/products?sort=discount" className="text-sm text-moss-600 hover:underline">View all</Link>
        </div>
        <ProductGrid products={featured} loading={loading} />
      </section>

      {/* Best sellers */}
      <section className="container-app py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl sm:text-3xl text-ink">Best Sellers</h2>
          <Link to="/products?sort=popularity" className="text-sm text-moss-600 hover:underline">View all</Link>
        </div>
        <ProductGrid products={bestSellers} loading={loading} />
      </section>

      {/* New arrivals */}
      <section className="container-app py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl sm:text-3xl text-ink">New Arrivals</h2>
          <Link to="/products?sort=newest" className="text-sm text-moss-600 hover:underline">View all</Link>
        </div>
        <ProductGrid products={newArrivals} loading={loading} />
      </section>

      {/* Promotional banner */}
      <section className="container-app pb-16">
        <div className="rounded-xl2 bg-clay text-white px-6 py-10 sm:px-12 sm:py-14 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl mb-1">Get 20% off your first order</h3>
            <p className="text-white/80 text-sm">Create an account and shop your first ShopSphere haul.</p>
          </div>
          <Link to="/register" className="shrink-0 rounded-full bg-white text-clay px-6 py-3 text-sm font-medium hover:bg-white/90">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  )
}
