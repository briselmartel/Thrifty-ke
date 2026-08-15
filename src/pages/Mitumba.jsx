import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard'

export default function Mitumba() {
  const [racks, setRacks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('listings')
        .select('*, profiles!inner(id, full_name, seller_type)')
        .eq('status', 'active')
        .eq('category', 'clothing')
        .eq('profiles.seller_type', 'thrift_store')
        .order('created_at', { ascending: false })

      if (!error && data) {
        // Group into "racks" - one per store, like walking past a row of racks
        const byStore = {}
        for (const item of data) {
          const storeId = item.profiles?.id
          if (!byStore[storeId]) {
            byStore[storeId] = { storeName: item.profiles?.full_name || 'Thrift Store', items: [] }
          }
          byStore[storeId].items.push(item)
        }
        setRacks(Object.values(byStore))
      }
      setLoading(false)
    }
    load()
  }, [])

  const allItems = racks.flatMap((r) => r.items)

  return (
    <div>
      {/* Store-front hero */}
      <section className="border-b border-white/10" style={{ background: 'linear-gradient(180deg, var(--color-ink-2) 0%, var(--color-ink) 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 text-center">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-white/15 mb-4" style={{ color: 'var(--color-gold)' }}>
            Mitumba Floor
          </div>
          <h1 className="font-display text-4xl sm:text-5xl mb-3">Walk the racks</h1>
          <p className="opacity-70 max-w-lg mx-auto">
            Browse Thrifty's thrift stores rack by rack, just like flipping through hangers in person - every piece still comes with escrow protection.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading && <p className="opacity-60 text-sm">Setting up the racks…</p>}

        {!loading && racks.length === 0 && (
          <div className="text-center py-20 opacity-60">
            <p className="font-display text-xl mb-2">No thrift stores stocked yet.</p>
            <p className="text-sm">
              Run a mitumba shop? <Link to="/signup" className="underline" style={{ color: 'var(--color-gold)' }}>Open your rack on Thrifty</Link>.
            </p>
          </div>
        )}

        {/* New arrivals rail - freshest pieces across every store, like a front-of-store display */}
        {!loading && allItems.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-2xl">Fresh on the floor</h2>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}>NEW</span>
            </div>
            <div className="shelf-scroll flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {allItems.slice(0, 10).map((item) => (
                <div key={item.id} className="w-[46%] sm:w-[220px] shrink-0">
                  <ProductCard listing={item} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* One rack per store */}
        {racks.map((rack, i) => (
          <section key={i} className="mb-14">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0" style={{ background: 'var(--color-ink-3)', border: '1px solid var(--color-line)' }}>
                {rack.storeName?.[0]?.toUpperCase() || 'T'}
              </div>
              <div>
                <h3 className="font-display text-xl leading-tight">{rack.storeName}'s Rack</h3>
                <p className="text-xs opacity-50">{rack.items.length} piece{rack.items.length !== 1 ? 's' : ''} on this rack</p>
              </div>
            </div>
            <div className="shelf-scroll flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {rack.items.map((item) => (
                <div key={item.id} className="w-[46%] sm:w-[220px] shrink-0">
                  <ProductCard listing={item} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
