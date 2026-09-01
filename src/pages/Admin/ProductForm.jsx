import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../../context/ToastContext'
import AdminNavbar from '../../components/AdminNavbar'
import LoadingSpinner from '../../components/LoadingSpinner'

const emptyForm = {
  name: '', description: '', price: '', original_price: '', category_id: '',
  image_url: '', stock: '', specifications: '',
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const toast = useToast()

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setForm({
          name: data.name,
          description: data.description || '',
          price: data.price,
          original_price: data.original_price || '',
          category_id: data.category_id || '',
          image_url: data.image_url || '',
          stock: data.stock,
        })
      }
      setLoading(false)
    })
  }, [id, isEdit])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file)
    if (uploadError) {
      toast.error('Upload failed. Make sure a public "product-images" storage bucket exists in Supabase, or paste an image URL instead.')
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setForm((f) => ({ ...f, image_url: data.publicUrl }))
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.price || !form.category_id || form.stock === '') {
      setError('Please fill in name, price, category, and stock.')
      return
    }
    setError('')
    setSaving(true)

    const price = Number(form.price)
    const originalPrice = form.original_price ? Number(form.original_price) : price
    const discountPercentage = originalPrice > price ? Math.round(100 - (price / originalPrice) * 100) : 0

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      original_price: originalPrice,
      discount_percentage: discountPercentage,
      category_id: form.category_id,
      image_url: form.image_url.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      stock: Number(form.stock),
    }

    const { error } = isEdit
      ? await supabase.from('products').update(payload).eq('id', id)
      : await supabase.from('products').insert(payload)

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    toast.success(isEdit ? 'Product updated.' : 'Product created.')
    navigate('/admin/products')
  }

  if (loading) return <LoadingSpinner label="Loading product" className="py-24" />

  return (
    <div>
      <AdminNavbar title={isEdit ? 'Edit Product' : 'Add Product'} />
      <form onSubmit={handleSubmit} className="p-4 md:p-6 max-w-2xl space-y-4">
        <Field label="Product name" value={form.name} onChange={set('name')} />
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={4}
            className="w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-moss-400 focus:outline-none"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Price (₹)" type="number" value={form.price} onChange={set('price')} />
          <Field label="Original price (₹, optional)" type="number" value={form.original_price} onChange={set('original_price')} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Category</label>
            <select
              value={form.category_id}
              onChange={set('category_id')}
              className="w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-moss-400 focus:outline-none"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Field label="Stock" type="number" value={form.stock} onChange={set('stock')} />
        </div>
        <Field
          label="Image URL"
          value={form.image_url}
          onChange={set('image_url')}
          placeholder="https://images.unsplash.com/..."
        />
        <div>
          <label className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm cursor-pointer hover:border-ink/30">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Or upload an image'}
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
        {form.image_url && (
          <img src={form.image_url} alt="Preview" className="h-32 w-32 rounded-xl object-cover border border-line" />
        )}

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-moss-600 text-white px-6 py-2.5 text-sm font-medium hover:bg-moss-700 disabled:opacity-60 flex items-center gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line px-4 py-2.5 text-sm focus:border-moss-400 focus:outline-none"
      />
    </div>
  )
}
