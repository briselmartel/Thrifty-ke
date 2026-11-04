import { useEffect, useState } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../lib/constants'

const ICONS = {
  home: 'M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1V11z',
  shop: 'M6 7h12l1 13H5L6 7zm3 0a3 3 0 016 0',
  tag: 'M3 12V4h8l10 10-8 8L3 12zm5-4h.01',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
  plus: 'M12 5v14M5 12h14',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9a8 8 0 0116 0',
  login: 'M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  admin: 'M4 4h16v16H4zM4 10h16M10 10v10',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  chevron: 'M9 6l6 6-6 6',
  left: 'M15 6l-6 6 6 6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6L6 18',
}

function Icon({ name, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform ${className}`}
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  )
}

export default function Sidebar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('thrifty-sidebar') === 'collapsed' } catch (e) { return false }
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [location.pathname, location.search])

  function toggleCollapsed() {
    const next = !collapsed
    setCollapsed(next)
    try { localStorage.setItem('thrifty-sidebar', next ? 'collapsed' : 'expanded') } catch (e) {}
  }

  async function handleSignOut() {
    await signOut()
    setMobileOpen(false)
    navigate('/')
  }

  const isSeller = profile?.role === 'seller'
  const isAdmin = profile?.is_admin === true || profile?.role === 'admin'

  const mainLinks = [
    { to: '/', label: 'Home', icon: 'home', end: true },
    { to: '/shop', label: 'Browse', icon: 'shop' },
    { to: '/mitumba', label: 'Mitumba', icon: 'tag' },
    { to: '/how-it-works', label: 'How escrow works', icon: 'shield' },
    { to: '/accounts', label: 'Digital accounts', icon: 'grid' },
  ]

  const accountLinks = []
  if (isSeller) accountLinks.push({ to: '/sell', label: 'Sell an item', icon: 'plus' })
  if (user) accountLinks.push({ to: '/dashboard', label: 'My account', icon: 'user' })
  if (isAdmin) accountLinks.push({ to: '/admin', label: 'Admin', icon: 'admin' })
  if (!user) accountLinks.push({ to: '/login', label: 'Log in', icon: 'login' })

  const linkBase = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors'

  function renderLink(item, compact) {
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        title={compact ? item.label : undefined}
        className={({ isActive }) =>
          `${linkBase} ${compact ? 'justify-center' : ''} ${
            isActive ? 'bg-white/10 text-[var(--color-gold)]' : 'opacity-80 hover:opacity-100 hover:bg-white/5'
          }`
        }
      >
        <Icon name={item.icon} />
        {!compact && <span>{item.label}</span>}
      </NavLink>
    )
  }

  function renderNav(compact) {
    return (
      <>
        <div className="space-y-1">
          {mainLinks.map((item) => renderLink(item, compact))}
        </div>

        {!compact && (
          <div className="mt-1">
            <button
              onClick={() => setCatsOpen(!catsOpen)}
              aria-expanded={catsOpen}
              className={`${linkBase} w-full opacity-80 hover:opacity-100 hover:bg-white/5`}
            >
              <Icon name="grid" />
              <span className="flex-1 text-left">Categories</span>
              <Icon name="chevron" className={catsOpen ? 'rotate-90' : ''} />
            </button>
            {catsOpen && (
              <div className="ml-5 pl-3 border-l border-white/10 mt-1 space-y-0.5">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/shop?category=${c.slug}`}
                    className="block px-3 py-1.5 rounded-lg text-sm opacity-70 hover:opacity-100 hover:bg-white/5"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="my-3 border-t border-white/10" />

        <div className="space-y-1">
          {accountLinks.map((item) => renderLink(item, compact))}

          {!user && (
            <Link
              to="/signup"
              title={compact ? 'Join Thrifty' : undefined}
              className={`${linkBase} justify-center font-medium`}
              style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}
            >
              {compact ? <Icon name="user" /> : <span>Join Thrifty</span>}
            </Link>
          )}

          {user && (
            <button
              onClick={handleSignOut}
              title={compact ? 'Sign out' : undefined}
              className={`${linkBase} w-full opacity-80 hover:opacity-100 hover:bg-white/5 ${compact ? 'justify-center' : ''}`}
            >
              <Icon name="logout" />
              {!compact && <span>Sign out</span>}
            </button>
          )}
        </div>
      </>
    )
  }

  const logo = (compact) => (
    <Link to="/" className="font-display text-2xl tracking-wide" style={{ color: 'var(--color-cream)' }}>
      {compact ? 'T' : 'Thrifty'}
      <span style={{ color: 'var(--color-terracotta)' }}>{compact ? '.' : '.ke'}</span>
    </Link>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col sticky top-0 h-screen shrink-0 border-r border-white/10 bg-[#0E0F0D] transition-[width] duration-200 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <div className={`h-16 flex items-center border-b border-white/10 ${collapsed ? 'justify-center' : 'px-5'}`}>
          {logo(collapsed)}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">{renderNav(collapsed)}</nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
            title={collapsed ? 'Expand menu' : 'Collapse menu'}
            className={`${linkBase} w-full opacity-70 hover:opacity-100 hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
          >
            <Icon name="left" className={collapsed ? 'rotate-180' : ''} />
            {!collapsed && <span>Collapse menu</span>}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 h-14 px-4 flex items-center justify-between bg-[#0E0F0D]/95 backdrop-blur border-b border-white/10">
        {logo(false)}
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-2">
          <Icon name="menu" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[85%] h-full bg-[#0E0F0D] border-r border-white/10 flex flex-col">
            <div className="h-14 px-5 flex items-center justify-between border-b border-white/10">
              {logo(false)}
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2">
                <Icon name="close" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">{renderNav(false)}</nav>
          </div>
        </div>
      )}
    </>
  )
}