import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [orders, setOrders] = useState([])
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return
      setLoading(true)
      const { data: buyerOrders } = await supabase
        .from('orders')
        .select('*, listings(title, price, image_urls)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
      setOrders(buyerOrders || [])

      if (profile?.role === 'seller') {
        const { data: sellerListings } = await supabase
          .from('listings')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
        setListings(sellerListings || [])
      }
      setLoading(false)
    }
    load()
  }, [user, profile])

  if (!user) return <div className="max-w-xl mx-auto px-4 py-20 opacity-60 text-center">Please log in.</div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-3xl mb-1">Hi {profile?.full_name?.split(' ')[0] || ''}</h1>
        <p className="opacity-60 text-sm capitalize">
          {profile?.role} account
          {profile?.seller_type && ` · ${profile.seller_type.replace('_', ' ')}`}
          {profile?.role === 'seller' && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: profile.verification_status === 'verified' ? 'var(--color-teal)' : 'var(--color-ink-3)', color: profile.verification_status === 'verified' ? '#0E0F0D' : 'inherit' }}>
              {profile.verification_status === 'verified' ? 'Verified' : 'Verification pending'}
            </span>
          )}
        </p>
      </div>

      {profile?.role === 'seller' && (
        <section className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">My listings</h2>
            <Link to="/sell" className="text-sm px-4 py-2 rounded-full" style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}>
              + New listing
            </Link>
          </div>
          {loading && <p className="opacity-60 text-sm">Loading…</p>}
          {!loading && listings.length === 0 && <p className="opacity-60 text-sm">You haven't listed anything yet.</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {listings.map((l) => <ProductCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-2xl mb-4">My orders</h2>
        {loading && <p className="opacity-60 text-sm">Loading…</p>}
        {!loading && orders.length === 0 && <p className="opacity-60 text-sm">No orders yet — <Link to="/shop" className="underline" style={{ color: 'var(--color-gold)' }}>start browsing</Link>.</p>}
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/10">
              <div>
                <div className="text-sm font-medium">{o.listings?.title}</div>
                <div className="text-xs opacity-60">KSh {Number(o.amount).toLocaleString()}</div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full border border-white/15 capitalize">{o.status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
