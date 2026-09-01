import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

// Category browsing reuses the Products page's filtering logic, so this
// route just forwards to /products?category=slug to avoid duplicating it.
export default function Category() {
  const { slug } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(`/products?category=${encodeURIComponent(slug)}`, { replace: true })
  }, [slug, navigate])

  return null
}
