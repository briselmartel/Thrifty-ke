import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { ORDER_STATUS } from '../lib/constants'

// Admin access is controlled by profiles.is_admin = true (set manually in Supabase table editor).
export default function Admin() {
  const { profile } = useAuth()
  const [sellers, setSellers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    setLoading(true)
    const { data: sellerData } = await supabase.from('profiles').select('*').eq('role', 'seller').order('created_at', { ascending: false })
    setSellers(sellerData || [])
    const { data: orderData } = await supabase
      .from('orders')
      .select('*, listings(title), profiles!orders_buyer_id_fkey(full_name)')
      .order('created_at', { ascending: false })
    setOrders(orderData || [])
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  if (!profile?.is_admin) {
    return <div className="max-w-xl mx-auto px-4 py-20 opacity-60 text-center">You don't have access to this page.</div>
  }

  async function verifySeller(id, status) {
    await supabase.from('profiles').update({ verification_status: status }).eq('id', id)
    loadAll()
  }

  async function updateOrderStatus(id, status) {
    await supabase.from('orders').update({ status }).eq('id', id)
    loadAll()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl mb-8">Admin</h1>

      <section className="mb-14">
        <h2 className="font-display text-2xl mb-4">Seller verification</h2>
        {loading && <p className="opacity-60 text-sm">LoadingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</p>}
        <div className="space-y-3">
          {sellers.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/10">
              <div>
                <div className="text-sm font-medium">{s.full_name} <span className="opacity-50">({s.email})</span></div>
                <div className="text-xs opacity-60 capitalize">{s.seller_type?.replace('_', ' ')} Ãƒâ€šÃ‚Â· {s.verification_status}{s.phone && ` · ${s.phone}`}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => verifySeller(s.id, 'verified')} className="text-xs px-3 py-2 rounded-full" style={{ background: 'var(--color-teal)', color: '#0E0F0D' }}>Verify</button>
                <button onClick={() => verifySeller(s.id, 'rejected')} className="text-xs px-3 py-2 rounded-full border border-white/15">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4">Escrow & orders</h2>
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-white/10">
              <div>
                <div className="text-sm font-medium">{o.listings?.title}</div>
                <div className="text-xs opacity-60">Buyer: {o.profiles?.full_name} Ãƒâ€šÃ‚Â· KSh {Number(o.amount).toLocaleString()} Ãƒâ€šÃ‚Â· {o.payment_reference || 'no ref'}</div>
                {o.payment_proof_url && <a href={o.payment_proof_url} target="_blank" rel="noreferrer" className="text-xs underline" style={{ color: 'var(--color-gold)' }}>View proof</a>}
              </div>
              <select
                value={o.status}
                onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                className="text-xs px-3 py-2 rounded-full bg-[var(--color-ink-3)] border border-white/15"
              >
                {Object.values(ORDER_STATUS).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}