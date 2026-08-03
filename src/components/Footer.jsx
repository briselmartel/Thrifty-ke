import { Link } from 'react-router-dom'
import { CONTACT } from '../lib/constants'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="font-display text-xl mb-3">Thrifty<span style={{ color: 'var(--color-terracotta)' }}>.ke</span></div>
          <p className="text-sm opacity-70 leading-relaxed">
            Kenya's escrow-protected marketplace for pre-loved fashion, electronics, furniture and more. Buy and sell without the Instagram thrift-scam risk.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3" style={{ color: 'var(--color-gold)' }}>Marketplace</div>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/shop">Browse listings</Link></li>
            <li><Link to="/how-it-works">How escrow works</Link></li>
            <li><Link to="/signup">Become a seller</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3" style={{ color: 'var(--color-gold)' }}>Support</div>
          <ul className="space-y-2 text-sm opacity-80">
            <li><a href={CONTACT.phoneHref}>Call/WhatsApp {CONTACT.phone}</a></li>
            <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3" style={{ color: 'var(--color-gold)' }}>Trust</div>
          <p className="text-sm opacity-70 leading-relaxed">
            Every order is held in escrow until you confirm the item matches the listing. Sellers are verified before their shop goes live.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs opacity-50">
        Â© {new Date().getFullYear()} Thrifty.ke - Nairobi, Kenya
      </div>
    </footer>
  )
}