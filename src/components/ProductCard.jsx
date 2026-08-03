import { Link } from 'react-router-dom'

export default function ProductCard({ listing }) {
  const image = listing.image_urls?.[0]
  return (
    <Link
      to={`/product/${listing.id}`}
      className="group block w-full shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-[var(--color-ink-3)] hover:border-[var(--color-gold)] transition-colors"
    >
      <div className="aspect-[4/5] bg-[#14160F] overflow-hidden">
        {image ? (
          <img src={image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs opacity-40">No photo yet</div>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm font-medium truncate">{listing.title}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm" style={{ color: 'var(--color-terracotta)' }}>KSh {Number(listing.price).toLocaleString()}</span>
          <span className="text-[10px] uppercase tracking-wide opacity-50">{listing.condition}</span>
        </div>
      </div>
    </Link>
  )
}