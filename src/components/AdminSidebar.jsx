import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Users, Store } from 'lucide-react'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminSidebar() {
  return (
    <aside className="hidden md:flex md:w-56 shrink-0 flex-col border-r border-line bg-white min-h-[calc(100vh-4rem)] p-4">
      <Link_ />
      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
                isActive ? 'bg-moss-50 text-moss-700 font-medium' : 'text-ink/70 hover:bg-ink/5'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

function Link_() {
  return (
    <div className="flex items-center gap-2 px-3 pb-4 text-ink/70">
      <Store className="h-4 w-4" />
      <span className="text-xs font-semibold uppercase tracking-wide">Admin Panel</span>
    </div>
  )
}
