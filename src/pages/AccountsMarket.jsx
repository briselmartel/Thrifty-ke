import { Fragment, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'
import { ACCOUNT_PLATFORMS } from '../lib/accountPlatforms'

export default function AccountsMarket() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('sale')
  const [listings, setListings] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ platform: ACCOUNT_PLATFORMS[0], description: '', max_budget: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const [l, r] = await Promise.all([
      supabase.from('listings').select('*').eq('category', 'accounts').eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('account_requests').select('*').eq('status', 'open').order('created_at', { ascending: false }),
    ])
    setListings(l.data || [])
    setRequests(r.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function submitRequest(e) {
    e.preventDefault()
    setError('')
    if (!user) { navigate('/login'); return }
    setSaving(true)
    const { error: insertError } = await supabase.from('account_requests').insert({
      user_id: user.id,
      platform: form.platform,
      description: form.description || null,
      max_budget: form.max_budget ? Number(form.max_budget) : null,
    })
    setSaving(false)
    if (insertError) { setError(insertError.message); return }
    setForm({ platform: ACCOUNT_PLATFORMS[0], description: '', max_budget: '' })
    setShowForm(false)
    setTab('wanted')
    load()
  }

  async function closeRequest(id) {
    await supabase.from('account_requests').update({ status: 'closed' }).eq('id', id)
    load()
  }

  const rows = ACCOUNT_PLATFORMS
    .map((p) => ({
      platform: p,
      sale: listings.filter((l) => (l.platform || 'Other') === p).length,
      wanted: requests.filter((q) => q.platform === p).length,
    }))
    .filter((r) => r.sale || r.wanted)
    .sort((a, b) => (b.wanted - b.sale) - (a.wanted - a.sale))

  const shownListings = filter ? listings.filter((l) => (l.platform || 'Other') === filter) : listings
  const shownRequests = filter ? requests.filter((q) => q.platform === filter) : requests

  const input = 'w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none'
  const tabClass = (active) =>
    `px-4 py-2 rounded-full text-sm border ${active ? 'border-[var(--color-gold)]' : 'border-white/15 opacity-70'}`

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1">Digital accounts</h1>
          <p className="opacity-70 text-sm">See what is for sale and what people are looking for.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/sell?category=accounts"
            className="text-sm px-4 py-2 rounded-full"
            style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}
          >
            Sell an account
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm px-4 py-2 rounded-full border border-white/15 hover:border-[var(--color-gold)] transition-colors"
          >
            Request an account
          </button>
        </div>
      </div>

      {showForm && (
        <div className="p-5 rounded-2xl mb-8" style={{ background: 'var(--color-ink-3)', border: '1px solid var(--color-line)' }}>
          {!user ? (
            <p className="text-sm">
              Please <Link to="/login" className="underline" style={{ color: 'var(--color-gold)' }}>log in</Link> to post a request.
            </p>
          ) : (
            <form onSubmit={submitRequest} className="space-y-4">
              <h2 className="font-display text-lg">What account are you looking for?</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 opacity-80">Platform</label>
                  <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className={input}>
                    {ACCOUNT_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 opacity-80">Maximum budget (KSh, optional)</label>
                  <input type="number" min="0" value={form.max_budget} onChange={(e) => setForm({ ...form, max_budget: e.target.value })} className={input} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 opacity-80">Details</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={input}
                  placeholder="For example: age, followers or level you want. Do not put your phone number, email or passwords here."
                />
              </div>
              <p className="text-xs opacity-60">
                Requests for bank, M-Pesa, mobile money, betting or crypto accounts, or accounts in someone else's name, are not allowed and will be removed.
              </p>
              {error && <p className="text-sm" style={{ color: 'var(--color-terracotta)' }}>{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-full font-medium disabled:opacity-50"
                style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}
              >
                {saving ? 'Posting...' : 'Post request'}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl border border-white/10">
          <div className="text-2xl">{listings.length}</div>
          <div className="text-xs opacity-60">Accounts for sale</div>
        </div>
        <div className="p-4 rounded-2xl border border-white/10">
          <div className="text-2xl">{requests.length}</div>
          <div className="text-xs opacity-60">Accounts wanted</div>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="p-5 rounded-2xl border border-white/10 mb-8">
          <h2 className="font-display text-lg mb-3">Where the market is</h2>
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-8 gap-y-2 text-sm">
            <div className="opacity-60">Platform</div>
            <div className="opacity-60 text-right">For sale</div>
            <div className="opacity-60 text-right">Wanted</div>
            {rows.map((r) => (
              <Fragment key={r.platform}>
                <div>
                  {r.platform}
                  {r.wanted > r.sale && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-teal)', color: '#0E0F0D' }}>
                      In demand
                    </span>
                  )}
                </div>
                <div className="text-right">{r.sale}</div>
                <div className="text-right">{r.wanted}</div>
              </Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button onClick={() => setTab('sale')} className={tabClass(tab === 'sale')}>For sale ({listings.length})</button>
        <button onClick={() => setTab('wanted')} className={tabClass(tab === 'wanted')}>Wanted ({requests.length})</button>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="ml-auto px-4 py-2 rounded-full bg-[var(--color-ink-3)] border border-white/15 text-sm outline-none"
        >
          <option value="">All platforms</option>
          {ACCOUNT_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading && <p className="opacity-60 text-sm">Loading...</p>}

      {!loading && tab === 'sale' && (
        <>
          {shownListings.length === 0 && (
            <div className="text-center py-16 opacity-60">
              <p className="font-display text-xl mb-2">No accounts for sale here yet.</p>
              <p className="text-sm">
                Have one to sell? <Link to="/sell?category=accounts" className="underline" style={{ color: 'var(--color-gold)' }}>List it</Link>.
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {shownListings.map((l) => <ProductCard key={l.id} listing={l} />)}
          </div>
        </>
      )}

      {!loading && tab === 'wanted' && (
        <>
          {shownRequests.length === 0 && (
            <div className="text-center py-16 opacity-60">
              <p className="font-display text-xl mb-2">No requests here yet.</p>
              <p className="text-sm">Looking for an account? Use the Request an account button.</p>
            </div>
          )}
          <div className="space-y-3">
            {shownRequests.map((q) => (
              <div key={q.id} className="p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{q.platform}</div>
                  {q.description && <p className="text-sm opacity-70 mt-1 whitespace-pre-line">{q.description}</p>}
                  <div className="text-xs opacity-50 mt-2">
                    {q.max_budget ? `Budget up to KSh ${Number(q.max_budget).toLocaleString()}` : 'Budget not stated'} - Posted {new Date(q.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/sell?category=accounts&platform=${encodeURIComponent(q.platform)}`}
                    className="text-sm px-4 py-2 rounded-full"
                    style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}
                  >
                    I have this
                  </Link>
                  {user && user.id === q.user_id && (
                    <button
                      onClick={() => closeRequest(q.id)}
                      className="text-sm px-4 py-2 rounded-full border border-white/15"
                    >
                      Close request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}