import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, CONDITIONS } from '../lib/constants'

export default function Sell() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: CATEGORIES[0].slug, condition: CONDITIONS[0], size: '',
  })
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-3xl mb-2">List an item</h1>
      <p className="opacity-70 text-sm mb-8">Clear photos and honest descriptions sell faster — and keep your escrow disputes at zero.</p>

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
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 opacity-80">Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none"
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
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 opacity-80">Size (optional)</label>
            <input
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 opacity-80">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none"
            >
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 opacity-80">Condition</label>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none"
            >
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {error && <p className="text-sm" style={{ color: 'var(--color-terracotta)' }}>{error}</p>}

        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3 rounded-full font-medium disabled:opacity-50"
          style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}
        >
          {uploading ? 'Publishing…' : 'Publish listing'}
        </button>
      </form>
    </div>
  )
}
