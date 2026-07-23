import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CATEGORIES } from '../lib/constants'
import Shelf from '../components/Shelf'

export default function Landing() {
  const [byCategory, setByCategory] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(60)

      if (!error && data) {
        const grouped = {}
        for (const item of data) {
          if (!grouped[item.category]) grouped[item.category] = []
          grouped[item.category].push(item)
        }
        setByCategory(grouped)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-white/15 mb-6" style={{ color: 'var(--color-gold)' }}>
              Kenya's first escrow-protected thrift market
            </div>
            <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-6">
              Buy pre-loved.<br />Sell with proof.<br />
              <span style={{ color: 'var(--color-terracotta)' }}>Never lose money to a scam page.</span>
            </h1>
            <p className="text-base opacity-75 mb-8 max-w-md">
              Thrifty holds your payment until you confirm the item is exactly as described — no more sending money to an Instagram thrift page and hoping for the best.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="px-6 py-3 rounded-full font-medium" style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}>
                Start browsing
              </Link>
              <Link to="/signup" className="px-6 py-3 rounded-full font-medium border border-white/20 hover:border-[var(--color-gold)]">
                Sell on Thrifty
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl border border-white/10 p-6 grid grid-cols-2 gap-4" style={{ background: 'var(--color-ink-2)' }}>
              {['Clothing', 'Electronics', 'Seats & Furniture', 'Home & Living'].map((c) => (
                <div key={c} className="rounded-2xl aspect-square flex items-end p-4 text-sm font-medium" style={{ background: 'var(--color-ink-3)', border: '1px solid var(--color-line)' }}>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
        <div className="p-5 rounded-2xl border border-white/10">
          <div className="font-display text-lg mb-1" style={{ color: 'var(--color-teal)' }}>1. Pay into escrow</div>
          <p className="opacity-70">Send payment by bank transfer — held safely by Thrifty, not the seller.</p>
        </div>
        <div className="p-5 rounded-2xl border border-white/10">
          <div className="font-display text-lg mb-1" style={{ color: 'var(--color-teal)' }}>2. Receive & inspect</div>
          <p className="opacity-70">Check the item against the listing before anything is released.</p>
        </div>
        <div className="p-5 rounded-2xl border border-white/10">
          <div className="font-display text-lg mb-1" style={{ color: 'var(--color-teal)' }}>3. We release funds</div>
          <p className="opacity-70">Confirm you're happy and the seller gets paid. Problem? We step in.</p>
        </div>
      </section>

      {/* Shelves */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {loading && <p className="opacity-60 text-sm">Loading fresh finds…</p>}
        {!loading && Object.keys(byCategory).length === 0 && (
          <div className="text-center py-20 opacity-60">
            <p className="font-display text-xl mb-2">The shelves are empty — for now.</p>
            <p className="text-sm">Be the first seller to stock Thrifty. <Link to="/signup" className="underline" style={{ color: 'var(--color-gold)' }}>Sign up to sell</Link>.</p>
          </div>
        )}
        {CATEGORIES.map((c) => (
          <Shelf key={c.slug} title={c.label} categorySlug={c.slug} listings={byCategory[c.slug]} />
        ))}
      </section>
    </div>
  )
}
