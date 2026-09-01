import { Link } from 'react-router-dom'

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative overflow-hidden rounded-xl2 aspect-[4/5] block"
    >
      <img
        src={category.image_url}
        alt={category.name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4">
        <h3 className="font-display text-white text-lg">{category.name}</h3>
      </div>
    </Link>
  )
}
