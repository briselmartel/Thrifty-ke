import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { BANK_DETAILS, POCHI_DETAILS, CONTACT, ORDER_STATUS } from '../lib/constants'

export default function Checkout() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [proofFile, setProofFile] = useState(null)
  const [reference, setReference] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('listings').select('*').eq('id', listingId).single()
      setListing(data)
    }
    load()
  }, [listingId])

  if (!user) { navigate('/login'); return null }
  if (!listing) return <div className="max-w-xl mx-auto px-4 py-20 opacity-60">Loading…</div>

  async function handleConfirm() {
    setError('')
    if (!address || !phone) { setError('Delivery address and phone are required.'); return }
    setSubmitting(true)
    try {
      let proofUrl = null
      if (proofFile) {
        const path = `${user.id}/${Date.now()}-${proofFile.name}`
        const { error: upErr } = await supabase.storage.from('order-photos').upload(path, proofFile)
        if (upErr) throw upErr
        const { data: pub } = supabase.storage.from('order-photos').getPublicUrl(path)
        proofUrl = pub.publicUrl
      }

      const { data: order, error: insertError } = await supabase.from('orders').insert({
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        amount: listing.price,
        status: proofUrl ? ORDER_STATUS.PAYMENT_SUBMITTED : ORDER_STATUS.PENDING_PAYMENT,
        payment_method: paymentMethod,
        payment_reference: reference || null,
        payment_proof_url: proofUrl,
        delivery_address: address,
        delivery_phone: phone,
      }).select().single()
      if (insertError) throw insertError

      await supabase.from('listings').update({ status: 'reserved' }).eq('id', listing.id)

      // Send the order receipt email. This never blocks checkout - if the
      // email fails for any reason, the order still goes through fine.
      supabase.functions.invoke('send-order-email', { body: { order_id: order.id } }).catch((emailErr) => {
        console.warn('Order email failed to send:', emailErr)
      })

      navigate(`/order-confirmation/${order.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-3xl mb-2">Checkout</h1>
      <p className="opacity-70 text-sm mb-8">{listing.title} - KSh {Number(listing.price).toLocaleString()}</p>

      {step === 1 && (
        <div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setPaymentMethod('bank_transfer')}
              className={`py-3 rounded-xl border text-sm ${paymentMethod === 'bank_transfer' ? 'border-[var(--color-gold)]' : 'border-white/15 opacity-70'}`}
              style={paymentMethod === 'bank_transfer' ? { background: 'var(--color-ink-3)' } : {}}
            >
              Bank transfer
            </button>
            <button
              onClick={() => setPaymentMethod('pochi')}
              className={`py-3 rounded-xl border text-sm ${paymentMethod === 'pochi' ? 'border-[var(--color-gold)]' : 'border-white/15 opacity-70'}`}
              style={paymentMethod === 'pochi' ? { background: 'var(--color-ink-3)' } : {}}
            >
              M-Pesa (Pochi la Biashara)
            </button>
          </div>

          {paymentMethod === 'bank_transfer' ? (
            <div className="p-5 rounded-2xl mb-6" style={{ background: 'var(--color-ink-3)', border: '1px solid var(--color-line)' }}>
              <h2 className="font-display text-lg mb-3" style={{ color: 'var(--color-teal)' }}>Pay by bank transfer into escrow</h2>
              <p className="text-sm opacity-75 mb-4">
                Transfer the exact amount below. Thrifty holds it until you confirm the item is as described, then releases it to the seller.
              </p>
              <dl className="text-sm space-y-1">
                <div className="flex justify-between"><dt className="opacity-60">Bank</dt><dd>{BANK_DETAILS.bankName}</dd></div>
                <div className="flex justify-between"><dt className="opacity-60">Account name</dt><dd>{BANK_DETAILS.accountName}</dd></div>
                <div className="flex justify-between"><dt className="opacity-60">Account number</dt><dd>{BANK_DETAILS.accountNumber}</dd></div>
                <div className="flex justify-between"><dt className="opacity-60">Branch</dt><dd>{BANK_DETAILS.branch}</dd></div>
                <div className="flex justify-between font-medium"><dt>Amount</dt><dd>KSh {Number(listing.price).toLocaleString()}</dd></div>
              </dl>
              <p className="text-xs opacity-50 mt-4">
                Having trouble? WhatsApp/call {CONTACT.phone} or email {CONTACT.email}.
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl mb-6" style={{ background: 'var(--color-ink-3)', border: '1px solid var(--color-line)' }}>
              <h2 className="font-display text-lg mb-3" style={{ color: 'var(--color-teal)' }}>Pay by M-Pesa into escrow</h2>
              <p className="text-sm opacity-75 mb-4">
                Send the exact amount below via Pochi la Biashara. Thrifty holds it until you confirm the item is as described, then releases it to the seller.
              </p>
              <dl className="text-sm space-y-1">
                <div className="flex justify-between"><dt className="opacity-60">Send via</dt><dd>Pochi la Biashara</dd></div>
                <div className="flex justify-between"><dt className="opacity-60">Name</dt><dd>{POCHI_DETAILS.name}</dd></div>
                <div className="flex justify-between"><dt className="opacity-60">Phone number</dt><dd>{POCHI_DETAILS.phone}</dd></div>
                <div className="flex justify-between font-medium"><dt>Amount</dt><dd>KSh {Number(listing.price).toLocaleString()}</dd></div>
              </dl>
              <p className="text-xs opacity-50 mt-4">
                On the M-Pesa app or *334#, choose Pay then Pochi la Biashara, and send to the number above. Trouble? WhatsApp/call {CONTACT.phone} or email {CONTACT.email}.
              </p>
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            className="w-full py-3 rounded-full font-medium"
            style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}
          >
            I've made the payment
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 opacity-80">Delivery address</label>
            <input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none"
              placeholder="Estate, building, area, town"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 opacity-80">Phone number</label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none"
              placeholder="07XX XXX XXX"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 opacity-80">Transaction reference (optional)</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 opacity-80">Upload payment proof (screenshot/slip)</label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => setProofFile(e.target.files[0])} className="w-full text-sm" />
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--color-terracotta)' }}>{error}</p>}

          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full py-3 rounded-full font-medium disabled:opacity-50"
            style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}
          >
            {submitting ? 'Submitting…' : 'Submit for escrow verification'}
          </button>
        </div>
      )}
    </div>
  )
}
