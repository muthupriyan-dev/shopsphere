import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white mt-20">
      <div className="container-app py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <Link to="/" className="font-display text-xl text-ink">
            Shop<span className="text-moss-600">Sphere</span>
          </Link>
          <p className="mt-2 text-sm text-ink/60">Everything you need, all in one place.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><Link to="/products" className="hover:text-ink">All Products</Link></li>
            <li><Link to="/category/electronics" className="hover:text-ink">Electronics</Link></li>
            <li><Link to="/category/fashion" className="hover:text-ink">Fashion</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink mb-3">Account</h4>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><Link to="/profile" className="hover:text-ink">Profile</Link></li>
            <li><Link to="/orders" className="hover:text-ink">My Orders</Link></li>
            <li><Link to="/wishlist" className="hover:text-ink">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-ink/60">
            <li>Free shipping over ₹999</li>
            <li>Cash on delivery available</li>
            <li>7-day easy returns</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4">
        <p className="container-app text-xs text-ink/40">© {new Date().getFullYear()} ShopSphere. Built for demonstration purposes.</p>
      </div>
    </footer>
  )
}
