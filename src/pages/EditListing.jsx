import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, CONDITIONS } from '../lib/constants'

const ADMIN_EMAIL = 'kaixaden6@gmail.com'

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState(null)
  const [sellerId, setSellerId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('listings').select('*').eq('id', id).single()
      if (data) {
        setSellerId(data.seller_id)
        setForm({
          title: data.title || '',
          description: data.description || '',
          price: data.price || '',
          category: data.category || CATEGORIES[0].slug,
          condition: data.condition || CONDITIONS[0],
          size: data.size || '',
        })
      }
    }
    load()
  }, [id])

  if (!user) return <div className="max-w-xl mx-auto px-4 py-20 text-center opacity-70">Please log in.</div>
  if (!form) return <div className="max-w-xl mx-auto px-4 py-20 text-center opacity-70">Loading...</div>
  if (user.id !== sellerId && user.email !== ADMIN_EMAIL) {
    return <div className="max-w-xl mx-auto px-4 py-20 text-center opacity-70">You can only edit your own listings.</div>
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const { error: updateError } = await supabase
      .from('listings')
      .update({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        size: form.size || null,
      })
      .eq('id', id)
    setSaving(false)
    if (updateError) { setError(updateError.message); return }
    navigate(`/product/${id}`)
  }

  const input = 'w-full px-4 py-3 rounded-xl bg-[var(--color-ink-3)] border border-white/15 focus:border-[var(--color-gold)] outline-none'

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-3xl mb-8">Edit listing</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 opacity-80">Title</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={input} />
        </div>
        <div>
          <label className="block text-sm mb-1 opacity-80">Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 opacity-80">Price (KSh)</label>
            <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={input} />
          </div>
          <div>
            <label className="block text-sm mb-1 opacity-80">Size</label>
            <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className={input} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 opacity-80">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={input}>
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 opacity-80">Condition</label>
            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={input}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="text-sm" style={{ color: 'var(--color-terracotta)' }}>{error}</p>}
        <button type="submit" disabled={saving} className="w-full py-3 rounded-full font-medium disabled:opacity-50" style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}