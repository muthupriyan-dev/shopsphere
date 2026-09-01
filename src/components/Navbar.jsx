import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, LogOut, LayoutDashboard, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabaseClient'

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    supabase.from('categories').select('id, name, slug').order('name').then(({ data }) => setCategories(data || []))
  }, [])

  const submitSearch = (e) => {
    e.preventDefault()
    setMobileOpen(false)
    navigate(query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : '/products')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container-app">
        <div className="flex h-16 items-center gap-4">
          <button
            className="lg:hidden text-ink"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link to="/" className="font-display text-xl sm:text-2xl text-ink shrink-0">
            Shop<span className="text-moss-600">Sphere</span>
          </Link>

          <form onSubmit={submitSearch} className="hidden md:flex flex-1 relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search for products..."
              aria-label="Search products"
              className="w-full rounded-full border border-line bg-white py-2 pl-10 pr-4 text-sm focus:border-moss-400 focus:outline-none"
            />
          </form>

          <nav className="hidden lg:flex items-center gap-5 text-sm text-ink/70">
            {categories.slice(0, 5).map((c) => (
              <Link key={c.id} to={`/category/${c.slug}`} className="hover:text-ink whitespace-nowrap">
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link to="/wishlist" aria-label="Wishlist" className="p-2 rounded-full hover:bg-ink/5 text-ink/70">
              <Heart className="h-5 w-5" />
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative p-2 rounded-full hover:bg-ink/5 text-ink/70">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-clay px-1 text-[10px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full p-2 hover:bg-ink/5 text-ink/70"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  aria-label="Account menu"
                >
                  <User className="h-5 w-5" />
                </button>
                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-48 rounded-xl2 border border-line bg-white p-1.5 shadow-soft"
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <p className="px-3 py-2 text-xs text-ink/50 truncate">{profile?.full_name || user.email}</p>
                    <Link to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-ink/5" onClick={() => setProfileOpen(false)}>
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link to="/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-ink/5" onClick={() => setProfileOpen(false)}>
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-ink/5" onClick={() => setProfileOpen(false)}>
                        <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        setProfileOpen(false)
                        await signOut()
                        navigate('/')
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <Link to="/login" className="rounded-full px-4 py-2 text-sm text-ink hover:bg-ink/5">
                  Login
                </Link>
                <Link to="/register" className="rounded-full bg-moss-600 px-4 py-2 text-sm text-white hover:bg-moss-700">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden pb-4">
            <form onSubmit={submitSearch} className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search for products..."
                className="w-full rounded-full border border-line bg-white py-2 pl-10 pr-4 text-sm"
              />
            </form>
            <div className="flex flex-col gap-1">
              {categories.map((c) => (
                <Link key={c.id} to={`/category/${c.slug}`} className="rounded-lg px-2 py-2 text-sm text-ink/80 hover:bg-ink/5" onClick={() => setMobileOpen(false)}>
                  {c.name}
                </Link>
              ))}
              {!user && (
                <div className="flex gap-2 mt-2">
                  <Link to="/login" className="flex-1 text-center rounded-full border border-line px-4 py-2 text-sm" onClick={() => setMobileOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="flex-1 text-center rounded-full bg-moss-600 px-4 py-2 text-sm text-white" onClick={() => setMobileOpen(false)}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
