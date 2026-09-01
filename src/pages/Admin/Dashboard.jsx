import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Package, ShoppingCart, IndianRupee, Clock, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import AdminNavbar from '../../components/AdminNavbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatCurrency } from '../../lib/format'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ count: userCount }, { count: productCount }, { data: orders }, { data: low }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount, order_status'),
        supabase.from('products').select('id, name, stock').lte('stock', 5).order('stock'),
      ])

      const totalOrders = orders?.length || 0
      const totalRevenue = (orders || []).reduce((sum, o) => sum + Number(o.total_amount), 0)
      const pendingOrders = (orders || []).filter((o) => o.order_status === 'pending').length

      setStats({ userCount, productCount, totalOrders, totalRevenue, pendingOrders })
      setLowStock(low || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner label="Loading dashboard" className="py-24" />

  const cards = [
    { label: 'Total Users', value: stats.userCount, icon: Users },
    { label: 'Total Products', value: stats.productCount, icon: Package },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: IndianRupee },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock },
    { label: 'Low-Stock Products', value: lowStock.length, icon: AlertTriangle },
  ]

  return (
    <div>
      <AdminNavbar title="Dashboard" />
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl2 border border-line bg-white p-5">
              <c.icon className="h-5 w-5 text-moss-600 mb-3" />
              <p className="font-display text-2xl text-ink">{c.value}</p>
              <p className="text-sm text-ink/50">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl2 border border-line bg-white p-5">
          <h2 className="font-semibold text-ink mb-3">Low-Stock Products</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-ink/50">All products are well stocked.</p>
          ) : (
            <div className="divide-y divide-line">
              {lowStock.map((p) => (
                <Link key={p.id} to={`/admin/products/${p.id}/edit`} className="flex items-center justify-between py-2.5 text-sm hover:text-moss-600">
                  <span>{p.name}</span>
                  <span className={p.stock === 0 ? 'text-red-600 font-medium' : 'text-amber-600 font-medium'}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
