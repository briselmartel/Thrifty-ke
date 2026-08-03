import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-4xl mb-3">Page not found</h1>
      <p className="opacity-70 mb-8">That page doesn't exist, or the item may have sold.</p>
      <Link to="/" className="px-6 py-3 rounded-full font-medium inline-block" style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}>
        Back to home
      </Link>
    </div>
  )
}