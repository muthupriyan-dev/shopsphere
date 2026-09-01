import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../../context/ToastContext'
import AdminNavbar from '../../components/AdminNavbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import { formatCurrency } from '../../lib/format'

export default function AdminProducts() {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [toDelete, setToDelete] = useState(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*, category:categories(name)').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

  const handleDelete = async () => {
    const { error } = await supabase.from('products').delete().eq('id', toDelete.id)
    if (error) {
      toast.error('Could not delete product — it may be referenced by existing orders.')
    } else {
      toast.success('Product deleted.')
      setProducts((prev) => prev.filter((p) => p.id !== toDelete.id))
    }
    setToDelete(null)
  }

  return (
    <div>
      <AdminNavbar title="Products" />
      <div className="p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-line py-2 pl-9 pr-4 text-sm"
            />
          </div>
          <Button as={Link} to="/admin/products/new" className="ml-auto">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading products" />
        ) : (
          <div className="rounded-xl2 border border-line bg-white overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-line text-left text-ink/50">
                  <th className="p-3 font-medium">Product</th>
                  <th className="p-3 font-medium">Category</th>
                  <th className="p-3 font-medium">Price</th>
                  <th className="p-3 font-medium">Stock</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-lg object-cover bg-moss-50" />
                        <span className="font-medium text-ink line-clamp-1 max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-ink/60">{p.category?.name || '—'}</td>
                    <td className="p-3 text-ink">{formatCurrency(p.price)}</td>
                    <td className="p-3">
                      <span className={p.stock === 0 ? 'text-red-600 font-medium' : p.stock <= 5 ? 'text-amber-600 font-medium' : 'text-ink/70'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/products/${p.id}/edit`} aria-label={`Edit ${p.name}`} className="p-2 rounded-lg hover:bg-ink/5 text-ink/60">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button onClick={() => setToDelete(p)} aria-label={`Delete ${p.name}`} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-ink/50">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete product?">
        <p className="text-sm text-ink/70 mb-5">
          This will permanently delete <strong>{toDelete?.name}</strong>. This can't be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
