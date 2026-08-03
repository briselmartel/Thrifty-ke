import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CATEGORIES } from '../lib/constants'
import ProductCard from '../components/ProductCard'

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || ''
  const [query, setQuery] = useState('')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let req = supabase.from('listings').select('*').eq('status', 'active').order('created_at', { ascending: false })
      if (category) req = req.eq('category', category)
      if (query) req = req.ilike('title', `%${query}%`)
      const { data, error } = await req
      if (!error) setListings(data || [])
      setLoading(false)
    }
    load()
  }, [category, query])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-3xl">Browse</h1>
        <input
          placeholder="Search listingsâ€¦"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="px-4 py-2 rounded-full bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none w-full sm:w-64 text-sm"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setParams(category ? {} : {})}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border ${!category ? 'border-[var(--color-gold)]' : 'border-white/15 opacity-70'}`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            onClick={() => setParams({ category: c.slug })}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border ${category === c.slug ? 'border-[var(--color-gold)]' : 'border-white/15 opacity-70'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && <p className="opacity-60 text-sm">Loadingâ€¦</p>}
      {!loading && listings.length === 0 && (
        <div className="text-center py-20 opacity-60">
          <p className="font-display text-xl mb-2">Nothing here yet.</p>
          <p className="text-sm">Check back soon, or try a different category.</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {listings.map((l) => <ProductCard key={l.id} listing={l} />)}
      </div>
    </div>
  )
}