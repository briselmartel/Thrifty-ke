import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, CONDITIONS } from '../lib/constants'
import { ACCOUNT_PLATFORMS } from '../lib/accountPlatforms'

export default function Sell() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const startCategory = CATEGORIES.some((c) => c.slug === params.get('category')) ? params.get('category') : CATEGORIES[0].slug
  const startPlatform = ACCOUNT_PLATFORMS.includes(params.get('platform')) ? params.get('platform') : ''

  const [form, setForm] = useState({
    title: '', description: '', price: '', category: startCategory, condition: CONDITIONS[0], size: '', platform: startPlatform,
  })
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')

  const isAccount = form.category === 'accounts'

  if (!user) {
    return <div className="max-w-xl mx-auto px-4 py-20 text-center opacity-70">Please log in as a seller to list an item.</div>
  }
  if (profile && profile.role !== 'seller') {
    return <div className="max-w-xl mx-auto px-4 py-20 text-center opacity-70">Your account is registered as a buyer. Contact support to switch to a seller account.</div>
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.title || !form.price) { setError('Title and price are required.'); return }
    if (isAccount && !form.platform) { setError('Please choose the platform for this account.'); return }
    if (isAccount && !agreed) { setError('Please confirm the account listing rules before publishing.'); return }
    setUploading(true)

    try {
      const imageUrls = []
      for (const file of files) {
        const path = `${user.id}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('listing-images').upload(path, file)
        if (uploadError) throw uploadError
        const { data: pub } = supabase.storage.from('listing-images').getPublicUrl(path)
        imageUrls.push(pub.publicUrl)
      }

      const { error: insertError } = await supabase.from('listings').insert({
        seller_id: user.id,
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        size: form.size || null,
        platform: isAccount ? form.platform : null,
        image_urls: imageUrls,
        status: 'active',
      })
      if (insertError) throw insertError

      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const input = 'w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none'

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-3xl mb-2">List an item</h1>
      <p className="opacity-70 text-sm mb-8">Clear photos and honest descriptions sell faster - and keep your escrow disputes at zero.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 opacity-80">Photos</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="w-full text-sm"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 opacity-80">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={input}
          />
        </div>
        <div>
          <label className="block text-sm mb-1 opacity-80">Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={input}
            placeholder={isAccount ? 'Platform, account age, what is included, any stats. Do NOT put the username, password or recovery details here.' : ''}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 opacity-80">Price (KSh)</label>
            <input
              required
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={input}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 opacity-80">Size (optional)</label>
            <input
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className={input}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 opacity-80">Category</label>
            <select
              value={form.category}
              onChange={(e) => { setForm({ ...form, category: e.target.value }); setAgreed(false) }}
              className={input}
            >
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 opacity-80">Condition</label>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className={input}
            >
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {isAccount && (
          <div>
            <label className="block text-sm mb-1 opacity-80">Platform</label>
            <select
              required
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className={input}
            >
              <option value="">Choose the platform...</option>
              {ACCOUNT_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}

        {isAccount && (
          <div className="p-5 rounded-2xl text-sm" style={{ background: 'var(--color-ink-3)', border: '1px solid var(--color-terracotta)' }}>
            <h2 className="font-display text-lg mb-2" style={{ color: 'var(--color-terracotta)' }}>Rules for listing an account</h2>
            <ul className="list-disc pl-5 space-y-1 opacity-85 mb-4">
              <li>Never put the username, password or recovery details in the listing. Login details are only shared after the buyer has paid.</li>
              <li>Only list accounts that are genuinely yours to sell.</li>
              <li><strong>Not allowed:</strong> bank, M-Pesa, mobile money, betting or crypto accounts, accounts verified with someone else's ID, and hacked, stolen or shared accounts.</li>
              <li>Some platforms do not allow accounts to be sold. The buyer accepts that risk, so describe the account honestly.</li>
              <li>After the sale, you must not log in to the account again or use your old recovery email or phone to take it back. Doing so can lead to a ban and legal action.</li>
            </ul>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1"
              />
              <span>I confirm this account is mine to sell, is not on the banned list, and I agree to these rules.</span>
            </label>
          </div>
        )}

        {error && <p className="text-sm" style={{ color: 'var(--color-terracotta)' }}>{error}</p>}

        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3 rounded-full font-medium disabled:opacity-50"
          style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}
        >
          {uploading ? 'Publishing...' : 'Publish listing'}
        </button>
      </form>
    </div>
  )
}