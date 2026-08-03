import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[#0E0F0D]/90 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-wide" style={{ color: 'var(--color-cream)' }}>
          Thrifty<span style={{ color: 'var(--color-terracotta)' }}>.ke</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/shop" className="hover:text-[var(--color-gold)] transition-colors">Browse</Link>
          <Link to="/how-it-works" className="hover:text-[var(--color-gold)] transition-colors">How escrow works</Link>
          {profile?.role === 'seller' && (
            <Link to="/sell" className="hover:text-[var(--color-gold)] transition-colors">Sell an item</Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm px-4 py-2 rounded-full border border-white/15 hover:border-[var(--color-gold)] transition-colors"
              >
                My account
              </Link>
              <button
                onClick={async () => { await signOut(); navigate('/') }}
                className="text-sm px-4 py-2 rounded-full"
                style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm px-4 py-2 rounded-full border border-white/15 hover:border-[var(--color-gold)] transition-colors">
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm px-4 py-2 rounded-full"
                style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}
              >
                Join Thrifty
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <div className="w-6 h-0.5 bg-[var(--color-cream)] mb-1.5" />
          <div className="w-6 h-0.5 bg-[var(--color-cream)] mb-1.5" />
          <div className="w-6 h-0.5 bg-[var(--color-cream)]" />
        </button>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 border-t border-white/10">
          <Link to="/shop" onClick={() => setOpen(false)} className="py-2">Browse</Link>
          <Link to="/how-it-works" onClick={() => setOpen(false)} className="py-2">How escrow works</Link>
          {profile?.role === 'seller' && <Link to="/sell" onClick={() => setOpen(false)} className="py-2">Sell an item</Link>}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="py-2">My account</Link>
              <button onClick={async () => { await signOut(); setOpen(false); navigate('/') }} className="py-2 text-left">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="py-2">Log in</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="py-2">Join Thrifty</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}