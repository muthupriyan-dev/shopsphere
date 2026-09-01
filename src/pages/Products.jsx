import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import SearchBar from '../components/SearchBar'
import ProductGrid from '../components/ProductGrid'
import Pagination from '../components/Pagination'

const PAGE_SIZE = 12

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const minPrice = searchParams.get('min') || ''
  const maxPrice = searchParams.get('max') || ''
  const minRating = searchParams.get('rating') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = Number(searchParams.get('page') || 1)

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []))
  }, [])

  useEffect(() => {
    let mounted = true
    setLoading(true)

    async function load() {
      let req = supabase.from('products').select('*, category:categories(name, slug)', { count: 'exact' })

      if (query) req = req.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      if (category) req = req.eq('category.slug', category)
      if (minPrice) req = req.gte('price', Number(minPrice))
      if (maxPrice) req = req.lte('price', Number(maxPrice))
      if (minRating) req = req.gte('rating', Number(minRating))

      if (sort === 'price_asc') req = req.order('price', { ascending: true })
      else if (sort === 'price_desc') req = req.order('price', { ascending: false })
      else if (sort === 'popularity') req = req.order('review_count', { ascending: false })
      else if (sort === 'discount') req = req.order('discount_percentage', { ascending: false })
      else req = req.order('created_at', { ascending: false })

      const from = (page - 1) * PAGE_SIZE
      req = req.range(from, from + PAGE_SIZE - 1)

      const { data, count, error } = await req
      if (!mounted) return
      if (!error) {
        // category filter via joined table needs client-side confirmation since
        // supabase's `.eq('category.slug', ...)` filters the join, not the row
        const filtered = category ? (data || []).filter((p) => p.category?.slug === category) : data || []
        setProducts(filtered)
        setTotal(category ? filtered.length : count || 0)
      }
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [query, category, minPrice, maxPrice, minRating, sort, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const clearFilters = () => setSearchParams(query ? { q: query } : {})

  const activeFilterCount = useMemo(
    () => [category, minPrice, maxPrice, minRating].filter(Boolean).length,
    [category, minPrice, maxPrice, minRating]
  )

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl text-ink">All Products</h1>
        <SearchBar value={query} onChange={(v) => updateParam('q', v)} onSubmit={(v) => updateParam('q', v)} className="sm:ml-auto sm:max-w-xs" />
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="rounded-xl2 border border-line bg-white p-4 space-y-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="font-medium text-sm">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X className="h-4 w-4" /></button>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Category</h3>
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm text-ink/70">
                  <input type="radio" name="category" checked={!category} onChange={() => updateParam('category', '')} />
                  All categories
                </label>
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm text-ink/70">
                    <input type="radio" name="category" checked={category === c.slug} onChange={() => updateParam('category', c.slug)} />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Price range (₹)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParam('min', e.target.value)}
                  className="w-full rounded-lg border border-line px-2 py-1.5 text-sm"
                />
                <span className="text-ink/40">–</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParam('max', e.target.value)}
                  className="w-full rounded-lg border border-line px-2 py-1.5 text-sm"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Minimum rating</h3>
              <div className="flex flex-col gap-1.5">
                {[4, 3, 2].map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm text-ink/70">
                    <input type="radio" name="rating" checked={minRating === String(r)} onChange={() => updateParam('rating', String(r))} />
                    {r}+ stars
                  </label>
                ))}
                <label className="flex items-center gap-2 text-sm text-ink/70">
                  <input type="radio" name="rating" checked={!minRating} onChange={() => updateParam('rating', '')} />
                  Any rating
                </label>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-clay hover:underline">Clear all filters</button>
            )}
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-ink/60">{loading ? 'Loading...' : `${total} result${total === 1 ? '' : 's'}`}</p>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="rounded-lg border border-line px-3 py-1.5 text-sm"
              aria-label="Sort products"
            >
              <option value="newest">Newest</option>
              <option value="popularity">Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Best Discount</option>
            </select>
          </div>

          <ProductGrid products={products} loading={loading} />
          <Pagination page={page} totalPages={totalPages} onChange={(p) => updateParam('page', String(p))} />
        </div>
      </div>
    </div>
  )
}
