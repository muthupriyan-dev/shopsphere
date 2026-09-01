import ProductCard from './ProductCard'
import EmptyState from './EmptyState'
import { ProductGridSkeleton } from './Skeleton'
import { PackageSearch } from 'lucide-react'

export default function ProductGrid({ products, loading }) {
  if (loading) return <ProductGridSkeleton />
  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No products found"
        description="Try adjusting your filters or search terms."
      />
    )
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
