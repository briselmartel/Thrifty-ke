import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'

export default function Shelf({ title, categorySlug, listings }) {
  if (!listings || listings.length === 0) return null
  return (
    <section className="mb-14">
      <div className="flex items-end justify-between mb-4 px-4 sm:px-0">
        <h3 className="font-display text-2xl">{title}</h3>
        <Link to={`/shop?category=${categorySlug}`} className="text-sm opacity-70 hover:opacity-100" style={{ color: 'var(--color-gold)' }}>
          See all →
        </Link>
      </div>
      <div className="shelf-scroll flex gap-4 overflow-x-auto pb-2 px-4 sm:px-0 -mx-4 sm:mx-0">
        {listings.map((l) => (
          <div key={l.id} className="w-[46%] sm:w-[220px] shrink-0">
            <ProductCard listing={l} />
          </div>
        ))}
      </div>
    </section>
  )
}
