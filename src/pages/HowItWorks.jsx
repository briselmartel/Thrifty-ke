import { Link } from 'react-router-dom'
import { CONTACT } from '../lib/constants'

const steps = [
  { title: 'Find an item you trust', body: 'Browse verified sellers and thrift stores. Every listing shows real photos, condition, and seller verification status.' },
  { title: 'Pay into escrow, not the seller', body: 'Transfer your payment by bank transfer. Thrifty holds the funds - the seller is never paid upfront.' },
  { title: 'Seller ships your item', body: 'Once your payment is verified, the seller is notified and ships to your delivery address.' },
  { title: 'You inspect before release', body: 'When your item arrives, check it against the listing. Happy? Confirm and the seller gets paid.' },
  { title: 'Problem? We step in', body: 'If the item is not as described, contact us before confirming and we help resolve it - including a refund from the held funds where appropriate.' },
]

export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-4xl mb-4">How escrow protects you</h1>
      <p className="opacity-75 mb-12">No more sending money to an Instagram thrift page and hoping the parcel shows up. Here's exactly how a Thrifty order works.</p>

      <div className="space-y-6 mb-14">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-5 p-5 rounded-2xl border border-white/10">
            <div className="font-display text-2xl w-8 shrink-0" style={{ color: 'var(--color-gold)' }}>{i + 1}</div>
            <div>
              <div className="font-medium mb-1">{s.title}</div>
              <div className="text-sm opacity-70">{s.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl text-center" style={{ background: 'var(--color-ink-3)', border: '1px solid var(--color-line)' }}>
        <p className="text-sm opacity-75 mb-4">Still have questions before you buy or sell?</p>
        <p className="text-sm">WhatsApp/call <a href={CONTACT.phoneHref} className="underline" style={{ color: 'var(--color-gold)' }}>{CONTACT.phone}</a> or email <a href={`mailto:${CONTACT.email}`} className="underline" style={{ color: 'var(--color-gold)' }}>{CONTACT.email}</a></p>
      </div>

      <div className="text-center mt-10">
        <Link to="/shop" className="px-6 py-3 rounded-full font-medium inline-block" style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}>
          Start browsing
        </Link>
      </div>
    </div>
  )
}