import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CONTACT } from '../lib/constants'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('orders').select('*, listings(title, price)').eq('id', orderId).single()
      setOrder(data)
    }
    load()
  }, [orderId])

  if (!order) return <div className="max-w-xl mx-auto px-4 py-20 opacity-60">Loadingâ€¦</div>

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="text-4xl mb-4" style={{ color: 'var(--color-gold)' }}>âœ“</div>
      <h1 className="font-display text-3xl mb-3">Order received</h1>
      <p className="opacity-75 mb-8">
        We're verifying your payment for <strong>{order.listings?.title}</strong>. Once confirmed, your order moves to escrow-held and the seller is notified to ship.
      </p>
      <div className="p-5 rounded-2xl border border-white/10 text-sm mb-8 text-left">
        <div className="flex justify-between mb-1"><span className="opacity-60">Order ID</span><span>{order.id.slice(0, 8)}</span></div>
        <div className="flex justify-between mb-1"><span className="opacity-60">Amount</span><span>KSh {Number(order.amount).toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="opacity-60">Status</span><span className="capitalize">{order.status.replace('_', ' ')}</span></div>
      </div>
      <p className="text-xs opacity-50 mb-8">
        Questions about your order? WhatsApp/call {CONTACT.phone} or email {CONTACT.email}.
      </p>
      <Link to="/dashboard" className="px-6 py-3 rounded-full font-medium inline-block" style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}>
        Go to my account
      </Link>
    </div>
  )
}